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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
const createEmployeeSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2),
    apellido: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    telefono: zod_1.z.string().min(7),
    direccion: zod_1.z.string().optional(),
    fechaNacimiento: zod_1.z.string().datetime().optional().nullable(),
    fechaContratacion: zod_1.z.string().datetime(),
    especialidad: zod_1.z.string().optional(),
    activo: zod_1.z.boolean().default(true),
    password: zod_1.z.string().min(6).optional(), // For creating User account
});
const updateEmployeeSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).optional(),
    apellido: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    telefono: zod_1.z.string().min(7).optional(),
    direccion: zod_1.z.string().optional(),
    fechaNacimiento: zod_1.z.string().datetime().optional().nullable(),
    fechaContratacion: zod_1.z.string().datetime().optional(),
    especialidad: zod_1.z.string().optional(),
    activo: zod_1.z.boolean().optional(),
});
// Create employee - ADMIN only
router.post('/', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = createEmployeeSchema.parse(req.body), { password, fechaContratacion } = _a, employeeData = __rest(_a, ["password", "fechaContratacion"]);
        // Create User account for employee
        const hashedPassword = yield bcryptjs_1.default.hash(password || 'defaultPassword123', 10);
        const user = yield prisma_1.default.user.create({
            data: {
                email: employeeData.email,
                password: hashedPassword,
                name: `${employeeData.nombre} ${employeeData.apellido}`,
                role: 'ADMIN'
            }
        });
        // Create Employee profile
        const employee = yield prisma_1.default.employee.create({
            data: Object.assign(Object.assign({}, employeeData), { userId: user.id, fechaNacimiento: employeeData.fechaNacimiento ? new Date(employeeData.fechaNacimiento) : null, fechaContratacion: new Date(fechaContratacion) }),
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        res.status(201).json(employee);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get all employees - ADMIN only (employees can't see other employees)
router.get('/', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield prisma_1.default.employee.findMany({
            include: {
                user: { select: { name: true, email: true } },
                appointments: {
                    where: {
                        estado: { in: ['PROGRAMADA', 'COMPLETADA'] }
                    },
                    orderBy: { fecha: 'desc' },
                    take: 1,
                    select: { fecha: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Add status text for display
        const employeesWithStatus = employees.map(employee => (Object.assign(Object.assign({}, employee), { statusText: employee.activo ? '✅ Activo' : '❌ Inactivo', lastAppointmentDate: employee.appointments.length > 0 ? employee.appointments[0].fecha : null })));
        res.json(employeesWithStatus);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get employees for dropdown (simplified view)
router.get('/dropdown', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield prisma_1.default.employee.findMany({
            // Show ALL employees (active and inactive)
            select: {
                id: true,
                nombre: true,
                apellido: true,
                especialidad: true,
                activo: true,
                fechaDesactivacion: true,
                // Fetch last appointment for relative time display
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
        // Format for dropdown display
        const formattedEmployees = employees.map(employee => ({
            id: employee.id,
            nombre: employee.nombre,
            apellido: employee.apellido,
            especialidad: employee.especialidad,
            activo: employee.activo,
            fechaDesactivacion: employee.fechaDesactivacion,
            lastAppointmentDate: employee.appointments.length > 0 ? employee.appointments[0].fecha : null
        }));
        res.json(formattedEmployees);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single employee
router.get('/:id', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const employee = yield prisma_1.default.employee.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update employee - ADMIN only
router.put('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const _a = updateEmployeeSchema.parse(req.body), { fechaContratacion, fechaNacimiento } = _a, data = __rest(_a, ["fechaContratacion", "fechaNacimiento"]);
        const updateData = Object.assign({}, data);
        if (fechaContratacion) {
            updateData.fechaContratacion = new Date(fechaContratacion);
        }
        if (fechaNacimiento !== undefined) {
            updateData.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
        }
        // Check if active status is changing
        if (data.activo !== undefined) {
            const currentEmployee = yield prisma_1.default.employee.findUnique({
                where: { id },
                select: { activo: true }
            });
            if (currentEmployee) {
                if (data.activo === false && currentEmployee.activo === true) {
                    // Deactivating: Set deactivation date
                    updateData.fechaDesactivacion = new Date();
                }
                else if (data.activo === true && currentEmployee.activo === false) {
                    // Reactivating: Clear deactivation date
                    updateData.fechaDesactivacion = null;
                }
            }
        }
        const employee = yield prisma_1.default.employee.update({
            where: { id },
            data: updateData,
            include: {
                user: { select: { name: true, email: true } }
            }
        });
        res.json(employee);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete employee - ADMIN only
router.delete('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const employee = yield prisma_1.default.employee.findUnique({
            where: { id }
        });
        if (!employee) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        // Delete employee (cascade will handle User deletion if configured)
        yield prisma_1.default.employee.delete({
            where: { id }
        });
        res.json({ message: 'Empleado eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
