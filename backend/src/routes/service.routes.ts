import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const createServiceSchema = z.object({
    nombre: z.string().min(2),
    descripcion: z.string().optional(),
    categoria: z.string().min(2),
    duracion: z.number().int().positive(),
    precio: z.number().positive(),
    activo: z.boolean().default(true),
});

const updateServiceSchema = z.object({
    nombre: z.string().min(2).optional(),
    descripcion: z.string().optional(),
    categoria: z.string().min(2).optional(),
    duracion: z.number().int().positive().optional(),
    precio: z.number().positive().optional(),
    activo: z.boolean().optional(),
});

// Create service
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const data = createServiceSchema.parse(req.body);

        const service = await prisma.service.create({
            data
        });

        res.status(201).json(service);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all services (optionally filter by activo)
router.get('/', async (req, res) => {
    try {
        const { activo } = req.query;

        const where: any = {};
        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const services = await prisma.service.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        appointments: {
                            where: {
                                estado: {
                                    in: ['PROGRAMADA', 'CONFIRMADA', 'COMPLETADA']
                                }
                            }
                        }
                    }
                }
            }
        });

        // Add appointmentCount and status text to each service
        const servicesWithCount = services.map(service => ({
            ...service,
            appointmentCount: service._count.appointments,
            statusText: service.activo ? '✅ Activo' : '❌ Inactivo'
        }));

        res.json(servicesWithCount);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get services for dropdown (simplified view)
router.get('/dropdown', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            // Show ALL services
            select: {
                id: true,
                nombre: true,
                precio: true,
                // We need appointment count to calculate active status dynamically
                _count: {
                    select: {
                        appointments: {
                            where: {
                                estado: { in: ['PROGRAMADA', 'COMPLETADA'] }
                            }
                        }
                    }
                }
            },
            orderBy: { nombre: 'asc' }
        });

        // Format for dropdown display
        const formattedServices = services.map(service => ({
            id: service.id,
            nombre: service.nombre,
            precio: service.precio,
            activo: service._count.appointments > 0
        }));

        res.json(formattedServices);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single service
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: {
                        cliente: true,
                        empleado: true
                    }
                }
            }
        });

        if (!service) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update service
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const data = updateServiceSchema.parse(req.body);

        const service = await prisma.service.update({
            where: { id },
            data
        });

        res.json(service);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete service
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.service.delete({
            where: { id }
        });

        res.json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
