import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

const router = Router();

const createEmployeeSchema = z.object({
    nombre: z.string().min(2),
    apellido: z.string().min(2),
    email: z.string().email(),
    telefono: z.string().min(7),
    direccion: z.string().optional(),
    fechaContratacion: z.string().datetime(),
    especialidad: z.string().optional(),
    activo: z.boolean().default(true),
    password: z.string().min(6).optional(), // For creating User account
});

const updateEmployeeSchema = z.object({
    nombre: z.string().min(2).optional(),
    apellido: z.string().min(2).optional(),
    email: z.string().email().optional(),
    telefono: z.string().min(7).optional(),
    direccion: z.string().optional(),
    fechaContratacion: z.string().datetime().optional(),
    especialidad: z.string().optional(),
    activo: z.boolean().optional(),
});

// Create employee
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { password, fechaContratacion, ...employeeData } = createEmployeeSchema.parse(req.body);

        // Create User account for employee
        const hashedPassword = await bcrypt.hash(password || 'defaultPassword123', 10);
        const user = await prisma.user.create({
            data: {
                email: employeeData.email,
                password: hashedPassword,
                name: `${employeeData.nombre} ${employeeData.apellido}`,
                role: 'ADMIN'
            }
        });

        // Create Employee profile
        const employee = await prisma.employee.create({
            data: {
                ...employeeData,
                userId: user.id,
                fechaContratacion: new Date(fechaContratacion)
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        res.status(201).json(employee);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single employee
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                appointments: {
                    include: {
                        cliente: true,
                        servicio: true
                    }
                }
            }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update employee
router.put('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { fechaContratacion, ...data } = updateEmployeeSchema.parse(req.body);

        const updateData: any = { ...data };
        if (fechaContratacion) {
            updateData.fechaContratacion = new Date(fechaContratacion);
        }

        // Check if active status is changing
        if (data.activo !== undefined) {
            const currentEmployee = await prisma.employee.findUnique({
                where: { id },
                select: { activo: true }
            });

            if (currentEmployee) {
                if (data.activo === false && currentEmployee.activo === true) {
                    // Deactivating: Set deactivation date
                    updateData.fechaDesactivacion = new Date();
                } else if (data.activo === true && currentEmployee.activo === false) {
                    // Reactivating: Clear deactivation date
                    updateData.fechaDesactivacion = null;
                }
            }
        }

        const employee = await prisma.employee.update({
            where: { id },
            data: updateData,
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        res.json(employee);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        // Delete employee (cascade will handle User deletion if configured)
        await prisma.employee.delete({
            where: { id }
        });

        res.json({ message: 'Empleado eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
