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
const router = (0, express_1.Router)();
const createClientSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2),
    apellido: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    telefono: zod_1.z.string().min(7),
    direccion: zod_1.z.string().optional(),
    fechaNacimiento: zod_1.z.string().datetime().optional().nullable(),
    notas: zod_1.z.string().optional(),
});
const updateClientSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).optional(),
    apellido: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    telefono: zod_1.z.string().min(7).optional(),
    direccion: zod_1.z.string().optional(),
    fechaNacimiento: zod_1.z.string().datetime().optional().nullable(),
    notas: zod_1.z.string().optional(),
});
// Create client - ADMIN only
router.post('/', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = createClientSchema.parse(req.body);
        const client = yield prisma_1.default.client.create({
            data
        });
        res.status(201).json(client);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}));
// Get all clients
router.get('/', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield prisma_1.default.client.findMany({
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
        const clientsWithStatus = clients.map(client => (Object.assign(Object.assign({}, client), { statusText: client.activo ? '✅ Activo' : '❌ Inactivo' })));
        res.json(clientsWithStatus);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}));
// Get clients for dropdown (simplified view)
router.get('/dropdown', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield prisma_1.default.client.findMany({
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
            let lastAppointmentDate = null;
            if (client.appointments.length > 0) {
                lastAppointmentDate = client.appointments[0].fecha;
                const appointmentDate = new Date(lastAppointmentDate);
                const timeDiff = now.getTime() - appointmentDate.getTime();
                isActive = timeDiff <= TWENTY_DAYS_MS;
            }
            return {
                id: client.id,
                nombre: client.nombre,
                apellido: client.apellido,
                notas: client.notas,
                activo: isActive,
                lastAppointmentDate: lastAppointmentDate
            };
        });
        res.json(formattedClients);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}));
// Get single client
router.get('/:id', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const client = yield prisma_1.default.client.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}));
// Update client - ADMIN only
router.put('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const _a = updateClientSchema.parse(req.body), { fechaNacimiento } = _a, data = __rest(_a, ["fechaNacimiento"]);
        const updateData = Object.assign({}, data);
        if (fechaNacimiento !== undefined) {
            updateData.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
        }
        const client = yield prisma_1.default.client.update({
            where: { id },
            data: updateData
        });
        res.json(client);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}));
// Delete client - ADMIN only
router.delete('/:id', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.client.delete({
            where: { id }
        });
        res.json({ message: 'Cliente eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}));
exports.default = router;
