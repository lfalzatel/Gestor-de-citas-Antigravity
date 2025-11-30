import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const createClientSchema = z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    email: z.string().email(),
    telefono: z.string().min(7),
    direccion: z.string().optional(),
    fechaNacimiento: z.string().datetime().optional().nullable(),
    notas: z.string().optional(),
});

const updateClientSchema = z.object({
    nombre: z.string().min(2).optional(),
    apellido: z.string().min(2).optional(),
    email: z.string().email().optional(),
    telefono: z.string().min(7).optional(),
    direccion: z.string().optional(),
    fechaNacimiento: z.string().datetime().optional().nullable(),
    notas: z.string().optional(),
});

// Create client
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const data = createClientSchema.parse(req.body);

        const client = await prisma.client.create({
            data
        });

        res.status(201).json(client);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: (error as any).message || 'Internal server error' });
    }
});

// Get all clients
router.get('/', authenticateToken, async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                appointments: {
                    where: {
                        estado: { in: ['PROGRAMADA', 'COMPLETADA'] }
                    },
                    orderBy: { fecha: 'desc' },
                    take: 1
                }
            }
        });

        // Add status text for display
        const clientsWithStatus = clients.map(client => ({
            ...client,
            statusText: client.activo ? '✅ Activo' : '❌ Inactivo'
        }));

        res.json(clientsWithStatus);
    } catch (error) {
        res.status(500).json({ error: (error as any).message || 'Internal server error' });
    }
});

// Get clients for dropdown (simplified view)
router.get('/dropdown', authenticateToken, async (req, res) => {
    try {
        const clients = await prisma.client.findMany({
            // Show all clients
            select: {
                id: true,
                nombre: true,
                apellido: true,
                notas: true,
                // We need appointments to calculate active status dynamically
                appointments: {
                    where: {
                        estado: { in: ['PROGRAMADA', 'COMPLETADA'] }
                    },
                    orderBy: { fecha: 'desc' },
                    take: 1,
                    select: { fecha: true }
                }
            },
            orderBy: { nombre: 'asc' }
        });

        const now = new Date();
        const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;

        // Format for dropdown display
        const formattedClients = clients.map(client => {
            let isActive = false;
            if (client.appointments.length > 0) {
                const lastAppointmentDate = new Date(client.appointments[0].fecha);
                const timeDiff = now.getTime() - lastAppointmentDate.getTime();
                isActive = timeDiff <= TWENTY_DAYS_MS;
            }

            return {
                id: client.id,
                nombre: client.nombre,
                apellido: client.apellido,
                notas: client.notas,
                activo: isActive
            };
        });

        res.json(formattedClients);
    } catch (error) {
        res.status(500).json({ error: (error as any).message || 'Internal server error' });
    }
});

// Get single client
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: {
                        servicio: true,
                        empleado: true
                    }
                }
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ error: (error as any).message || 'Internal server error' });
    }
});

// Update client
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { fechaNacimiento, ...data } = updateClientSchema.parse(req.body);

        const updateData: any = { ...data };
        if (fechaNacimiento !== undefined) {
            updateData.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
        }

        const client = await prisma.client.update({
            where: { id },
            data: updateData
        });

        res.json(client);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: (error as any).message || 'Internal server error' });
    }
});

// Delete client
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.client.delete({
            where: { id }
        });

        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: (error as any).message || 'Internal server error' });
    }
});

export default router;
