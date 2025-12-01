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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorization_middleware_1 = require("../middleware/authorization.middleware");
const router = (0, express_1.Router)();
const createServiceSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2),
    descripcion: zod_1.z.string().optional(),
    categoria: zod_1.z.string().min(2),
    duracion: zod_1.z.number().int().positive(),
    precio: zod_1.z.number().positive(),
    activo: zod_1.z.boolean().default(true),
});
const updateServiceSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).optional(),
    descripcion: zod_1.z.string().optional(),
    categoria: zod_1.z.string().min(2).optional(),
    duracion: zod_1.z.number().int().positive().optional(),
    precio: zod_1.z.number().positive().optional(),
    activo: zod_1.z.boolean().optional(),
});
// Create service - ADMIN only
router.post('/', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = createServiceSchema.parse(req.body);
        const service = yield prisma_1.default.service.create({
            data
        });
        res.status(201).json(service);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get all services (optionally filter by activo)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activo } = req.query;
        const where = {};
        if (activo !== undefined) {
            where.activo = activo === 'true';
        }
        const services = yield prisma_1.default.service.findMany({
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
        const servicesWithCount = services.map(service => (Object.assign(Object.assign({}, service), { appointmentCount: service._count.appointments, statusText: service.activo ? '✅ Activo' : '❌ Inactivo' })));
        res.json(servicesWithCount);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get services for dropdown (simplified view)
router.get('/dropdown', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield prisma_1.default.service.findMany({
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
            appointmentCount: service._count.appointments,
            activo: service._count.appointments > 0
        }));
        res.json(formattedServices);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single service
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const service = yield prisma_1.default.service.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update service - ADMIN only
router.put('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = updateServiceSchema.parse(req.body);
        const service = yield prisma_1.default.service.update({
            where: { id },
            data
        });
        res.json(service);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete service - ADMIN only
router.delete('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.service.delete({
            where: { id }
        });
        res.json({ message: 'Servicio eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
