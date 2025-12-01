"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorization_middleware_1 = require("../middleware/authorization.middleware");
const email_service_1 = require("../services/email.service");
const sms_service_1 = require("../services/sms.service");
const calendar_service_1 = require("../services/calendar.service");
const router = (0, express_1.Router)();
const createAppointmentSchema = zod_1.z.object({
    clienteId: zod_1.z.string(),
    servicioId: zod_1.z.string(),
    empleadoId: zod_1.z.string().optional(),
    fecha: zod_1.z.string().datetime(),
    horaInicio: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    notas: zod_1.z.string().optional(),
});
const updateAppointmentSchema = zod_1.z.object({
    clienteId: zod_1.z.string().optional(),
    servicioId: zod_1.z.string().optional(),
    empleadoId: zod_1.z.string().optional().nullable(),
    fecha: zod_1.z.string().datetime().optional(),
    horaInicio: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    estado: zod_1.z.enum(['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO ASISTIÓ', 'NO_ASISTIO']).optional(),
    notas: zod_1.z.string().optional(),
});
// Create appointment - ADMIN and EMPLEADO only (CLIENTE can't create their own appointments)
router.post('/', auth_middleware_1.authenticateToken, authorization_middleware_1.requireEmployeeOrAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = createAppointmentSchema.parse(req.body), { fecha, horaInicio, servicioId } = _a, rest = __rest(_a, ["fecha", "horaInicio", "servicioId"]);
        // Get service to calculate end time and total
        const service = yield prisma_1.default.service.findUnique({
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
        const appointment = yield prisma_1.default.appointment.create({
            data: Object.assign(Object.assign({}, rest), { servicioId, fecha: new Date(fecha), horaInicio,
                horaFin, total: service.precio, estado: 'PROGRAMADA' }),
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
        const emailTemplate = email_service_1.emailTemplates.newAppointment(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, appointmentDate, `${horaInicio} - ${horaFin}`, service.nombre);
        // Generate iCal attachment
        const icalAttachment = (0, calendar_service_1.generateAppointmentICal)(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, service.nombre, new Date(fecha), horaInicio, horaFin);
        // Send email with calendar attachment asynchronously (don't wait for it)
        (0, email_service_1.sendEmail)(appointment.cliente.email, emailTemplate, [icalAttachment]).catch(err => console.error('Failed to send email:', err));
        // Send SMS notification if client has phone number
        if (appointment.cliente.telefono) {
            const smsTemplate = sms_service_1.smsTemplates.newAppointment(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, appointmentDate, `${horaInicio} - ${horaFin}`, service.nombre);
            // Send SMS asynchronously (don't wait for it)
            (0, sms_service_1.sendSMS)(appointment.cliente.telefono, smsTemplate).catch(err => console.error('Failed to send SMS:', err));
        }
        res.status(201).json(appointment);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get all appointments (filtered by role)
// ADMIN: sees all appointments
// EMPLEADO: sees only their appointments
// CLIENTE: sees only their appointments
router.get('/', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { upcoming, clienteId, empleadoId } = req.query;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const where = {};
        if (upcoming === 'true') {
            where.fecha = { gte: new Date() };
            where.estado = { in: ['PROGRAMADA', 'CONFIRMADA'] };
        }
        // Role-based filtering
        if (userRole === 'EMPLEADO') {
            // EMPLEADO: only see their appointments
            const employee = yield prisma_1.default.employee.findUnique({
                where: { userId }
            });
            if (employee) {
                where.empleadoId = employee.id;
            }
        }
        else if (userRole === 'CLIENTE') {
            // CLIENTE: only see their appointments
            // TODO: Link Cliente to User in schema if needed
            // For now, CLIENTE can't see appointments via this endpoint
            return res.status(403).json({ error: 'Forbidden' });
        }
        // ADMIN: sees all appointments (no filtering)
        // If specific filters are provided and user is ADMIN
        if (userRole === 'ADMIN') {
            if (clienteId) {
                where.clienteId = clienteId;
            }
            if (empleadoId) {
                where.empleadoId = empleadoId;
            }
        }
        const appointments = yield prisma_1.default.appointment.findMany({
            where,
            include: {
                cliente: true,
                servicio: true,
                empleado: true
            },
            orderBy: { fecha: 'asc' }
        });
        res.json(appointments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single appointment
router.get('/:id', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const appointment = yield prisma_1.default.appointment.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update appointment - ADMIN and EMPLEADO only
router.put('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireEmployeeOrAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = updateAppointmentSchema.parse(req.body);
        // If service or time changes, we need to recalculate end time and total
        let updateData = Object.assign({}, data);
        // Handle NO_ASISTIO mapping
        if (data.estado === 'NO ASISTIÓ') {
            updateData.estado = 'NO_ASISTIO';
        }
        if (data.servicioId || data.horaInicio) {
            // Get current appointment to fallback if fields are missing in update
            const currentAppointment = yield prisma_1.default.appointment.findUnique({
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
                ? yield prisma_1.default.service.findUnique({ where: { id: serviceId } })
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
        const appointment = yield prisma_1.default.appointment.update({
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
                ? yield prisma_1.default.service.findUnique({ where: { id: data.servicioId } })
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
                emailTemplate = email_service_1.emailTemplates.statusChange(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, data.estado === 'NO ASISTIÓ' ? 'No Asistió' : data.estado, appointmentDate, `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`, service.nombre);
                smsTemplate = sms_service_1.smsTemplates.statusChange(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, data.estado === 'NO ASISTIÓ' ? 'No Asistió' : data.estado, appointmentDate, `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`, service.nombre);
            }
            else {
                // Regular update notification (date/time/service changed)
                emailTemplate = email_service_1.emailTemplates.newAppointment(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, appointmentDate, `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`, service.nombre);
                smsTemplate = sms_service_1.smsTemplates.newAppointment(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, appointmentDate, `${appointment.horaInicio} - ${appointment.horaFin || 'N/A'}`, service.nombre);
            }
            // Generate iCal attachment for updates too (only if we have end time)
            let icalAttachment;
            if (appointment.horaFin) {
                icalAttachment = (0, calendar_service_1.generateAppointmentICal)(`${appointment.cliente.nombre} ${appointment.cliente.apellido}`, service.nombre, new Date(appointment.fecha), appointment.horaInicio, appointment.horaFin);
            }
            // Send email with calendar attachment asynchronously (if available)
            const attachments = icalAttachment ? [icalAttachment] : [];
            (0, email_service_1.sendEmail)(appointment.cliente.email, emailTemplate, attachments).catch(err => console.error('Failed to send email:', err));
            // Send SMS notification if client has phone number
            if (appointment.cliente.telefono) {
                (0, sms_service_1.sendSMS)(appointment.cliente.telefono, smsTemplate).catch(err => console.error('Failed to send SMS:', err));
            }
        }
        res.json(appointment);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete appointment - ADMIN only
router.delete('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.appointment.delete({
            where: { id }
        });
        res.json({ message: 'Cita eliminada correctamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
