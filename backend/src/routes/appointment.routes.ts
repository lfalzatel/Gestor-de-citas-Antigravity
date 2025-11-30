import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth.middleware';
import { sendEmail, emailTemplates } from '../services/email.service';
import { sendSMS, smsTemplates } from '../services/sms.service';
import { generateAppointmentICal } from '../services/calendar.service';

const router = Router();

const createAppointmentSchema = z.object({
    clienteId: z.string(),
    servicioId: z.string(),
    empleadoId: z.string().optional(),
    fecha: z.string().datetime(),
    horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    notas: z.string().optional(),
});

const updateAppointmentSchema = z.object({
    clienteId: z.string().optional(),
    servicioId: z.string().optional(),
    empleadoId: z.string().optional().nullable(),
    fecha: z.string().datetime().optional(),
    horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    estado: z.enum(['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO ASISTIÓ', 'NO_ASISTIO']).optional(),
    notas: z.string().optional(),
});

// Create appointment
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { fecha, horaInicio, servicioId, ...rest } = createAppointmentSchema.parse(req.body);

        // Get service to calculate end time and total
        const service = await prisma.service.findUnique({
            where: { id: servicioId }
        });

        if (!service) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Calculate end time
        const [hours, minutes] = horaInicio.split(':').map(Number);
        const endMinutes = (hours * 60 + minutes + service.duracion) % (24 * 60);
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const horaFin = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

        const appointment = await prisma.appointment.create({
            data: {
                ...rest,
                servicioId,
                fecha: new Date(fecha),
                horaInicio,
                horaFin,
                total: service.precio,
                estado: 'PROGRAMADA'
            },
            include: {
                cliente: true,
                servicio: true,
                empleado: true
            }
        });

        // Send email notification with calendar attachment
        const appointmentDate = new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const emailTemplate = emailTemplates.newAppointment(
            `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
            appointmentDate,
            `${horaInicio} - ${horaFin}`,
            service.nombre
        );

        // Generate iCal attachment
        const icalAttachment = generateAppointmentICal(
            `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
            service.nombre,
            new Date(fecha),
            horaInicio,
            horaFin
        );

        // Send email with calendar attachment asynchronously (don't wait for it)
        sendEmail(appointment.cliente.email, emailTemplate, [icalAttachment]).catch(err =>
            console.error('Failed to send email:', err)
        );

        // Send SMS notification if client has phone number
        if (appointment.cliente.telefono) {
            const smsTemplate = smsTemplates.newAppointment(
                `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
                appointmentDate,
                `${horaInicio} - ${horaFin}`,
                service.nombre
            );

            // Send SMS asynchronously (don't wait for it)
            sendSMS(appointment.cliente.telefono, smsTemplate).catch(err =>
                console.error('Failed to send SMS:', err)
            );
        }

        res.status(201).json(appointment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all appointments (with filters)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { upcoming, clienteId, empleadoId } = req.query;

        const where: any = {};

        if (upcoming === 'true') {
            where.fecha = { gte: new Date() };
            where.estado = { in: ['PROGRAMADA', 'CONFIRMADA'] };
        }

        if (clienteId) {
            where.clienteId = clienteId as string;
        }

        if (empleadoId) {
            where.empleadoId = empleadoId as string;
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                cliente: true,
                servicio: true,
                empleado: true
            },
            orderBy: { fecha: 'asc' }
        });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single appointment
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                cliente: true,
                servicio: true,
                empleado: true
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update appointment
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const data = updateAppointmentSchema.parse(req.body);

        // If service or time changes, we need to recalculate end time and total
        let updateData: any = { ...data };

        // Handle NO_ASISTIO mapping
        if (data.estado === 'NO ASISTIÓ') {
            updateData.estado = 'NO_ASISTIO';
        }

        if (data.servicioId || data.horaInicio) {
            // Get current appointment to fallback if fields are missing in update
            const currentAppointment = await prisma.appointment.findUnique({
                where: { id },
                include: { servicio: true }
            });

            if (!currentAppointment) {
                return res.status(404).json({ error: 'Cita no encontrada' });
            }

            const serviceId = data.servicioId || currentAppointment.servicioId;
            const horaInicio = data.horaInicio || currentAppointment.horaInicio;

            // Get service details (either new or current)
            const service = data.servicioId
                ? await prisma.service.findUnique({ where: { id: serviceId } })
                : currentAppointment.servicio;

            if (!service) {
                return res.status(404).json({ error: 'Servicio no encontrado' });
            }

            // Recalculate end time
            const [hours, minutes] = horaInicio.split(':').map(Number);
            const endMinutes = (hours * 60 + minutes + service.duracion) % (24 * 60);
            const endHours = Math.floor(endMinutes / 60);
            const endMins = endMinutes % 60;
            const horaFin = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

            updateData.horaFin = horaFin;

            // Update total if service changed
            if (data.servicioId) {
                updateData.total = service.precio;
            }
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: {
                cliente: true,
                servicio: true,
                empleado: true
            }
        });

        // Send notifications if important fields changed
        const importantFieldsChanged = data.fecha || data.horaInicio || data.servicioId || data.estado;

        if (importantFieldsChanged) {
            // Get updated service info if service changed
            const service = data.servicioId
                ? await prisma.service.findUnique({ where: { id: data.servicioId } })
                : appointment.servicio;

            if (!service) {
                return res.status(404).json({ error: 'Servicio no encontrado' });
            }

            const appointmentDate = new Date(appointment.fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // Choose appropriate template based on status change
            let emailTemplate;
            let smsTemplate;

            if (data.estado && data.estado !== 'PROGRAMADA') {
                // Status change notification
                emailTemplate = emailTemplates.statusChange(
                    `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
                    data.estado === 'NO ASISTIÓ' ? 'No Asistió' : data.estado,
                    appointmentDate,
                    `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`,
                    service.nombre
                );

                smsTemplate = smsTemplates.statusChange(
                    `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
                    data.estado === 'NO ASISTIÓ' ? 'No Asistió' : data.estado,
                    appointmentDate,
                    `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`,
                    service.nombre
                );
            } else {
                // Regular update notification (date/time/service changed)
                emailTemplate = emailTemplates.newAppointment(
                    `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
                    appointmentDate,
                    `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`,
                    service.nombre
                );

                smsTemplate = smsTemplates.newAppointment(
                    `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
                    appointmentDate,
                    `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`,
                    service.nombre
                );
            }

            // Generate iCal attachment for updates too (only if we have end time)
            let icalAttachment;
            if (appointment.horaFin) {
                icalAttachment = generateAppointmentICal(
                    `${appointment.cliente.nombre} ${appointment.cliente.apellido}`,
                    service.nombre,
                    new Date(appointment.fecha),
                    appointment.horaInicio,
                    appointment.horaFin
                );
            }

            // Send email with calendar attachment asynchronously (if available)
            const attachments = icalAttachment ? [icalAttachment] : [];
            sendEmail(appointment.cliente.email, emailTemplate, attachments).catch(err =>
                console.error('Failed to send email:', err)
            );

            // Send SMS notification if client has phone number
            if (appointment.cliente.telefono) {
                sendSMS(appointment.cliente.telefono, smsTemplate).catch(err =>
                    console.error('Failed to send SMS:', err)
                );
            }
        }

        res.json(appointment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.appointment.delete({
            where: { id }
        });

        res.json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
