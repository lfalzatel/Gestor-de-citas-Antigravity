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
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorization_middleware_1 = require("../middleware/authorization.middleware");
const router = (0, express_1.Router)();
// Get appointment statistics for current month or specified month
router.get('/appointments', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
        const month = req.query.month ? parseInt(req.query.month) : now.getMonth(); // 0-indexed
        // Create dates in UTC to ensure we cover the full month regardless of server timezone
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                fecha: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth
                }
            },
            include: {
                servicio: true
            }
        });
        // Group by status
        const statusCounts = {
            'COMPLETADA': 0,
            'PROGRAMADA': 0,
            'CANCELADA': 0,
            'NO_ASISTIO': 0
        };
        let totalRevenue = 0;
        appointments.forEach(apt => {
            var _a;
            const estado = apt.estado === 'NO ASISTIÓ' ? 'NO_ASISTIO' : apt.estado;
            if (statusCounts.hasOwnProperty(estado)) {
                statusCounts[estado]++;
            }
            if (apt.estado === 'COMPLETADA' && ((_a = apt.servicio) === null || _a === void 0 ? void 0 : _a.precio)) {
                totalRevenue += Number(apt.servicio.precio);
            }
        });
        const total = appointments.length;
        const stats = Object.keys(statusCounts).map(estado => {
            const count = statusCounts[estado];
            return {
                estado: estado === 'NO_ASISTIO' ? 'NO ASISTIÓ' : estado,
                count,
                percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
            };
        });
        res.json({ total, stats, totalRevenue });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get most popular services
router.get('/popular-services', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy } = req.query; // 'count' or 'revenue'
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                fecha: {
                    gte: firstDayOfMonth
                }
            },
            include: {
                servicio: true
            }
        });
        // Count by service and calculate total revenue
        const serviceCounts = {};
        appointments.forEach(apt => {
            if (apt.servicio) {
                const id = apt.servicio.id;
                if (!serviceCounts[id]) {
                    serviceCounts[id] = { service: apt.servicio, count: 0, totalRevenue: 0 };
                }
                serviceCounts[id].count++;
                serviceCounts[id].totalRevenue += Number(apt.servicio.precio);
            }
        });
        // Sort by count or revenue
        const sortFunction = sortBy === 'revenue'
            ? (a, b) => b.totalRevenue - a.totalRevenue
            : (a, b) => b.count - a.count;
        // Sort and get top 3
        const topServices = Object.values(serviceCounts)
            .sort(sortFunction)
            .slice(0, 3)
            .map((item, index) => ({
            rank: index + 1,
            nombre: item.service.nombre,
            precio: item.service.precio,
            citas: item.count,
            totalRevenue: item.totalRevenue
        }));
        res.json(topServices);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get top clients (most completed appointments) - ADMIN only
router.get('/top-clients', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy } = req.query; // 'count' or 'revenue'
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                estado: 'COMPLETADA'
            },
            include: {
                cliente: true,
                servicio: true
            }
        });
        // Count by client
        const clientCounts = {};
        appointments.forEach(apt => {
            var _a;
            if (apt.cliente) {
                const id = apt.cliente.id;
                if (!clientCounts[id]) {
                    clientCounts[id] = { client: apt.cliente, count: 0, totalSpent: 0 };
                }
                clientCounts[id].count++;
                if ((_a = apt.servicio) === null || _a === void 0 ? void 0 : _a.precio) {
                    clientCounts[id].totalSpent += Number(apt.servicio.precio);
                }
            }
        });
        // Sort by count or revenue
        const sortFunction = sortBy === 'revenue'
            ? (a, b) => b.totalSpent - a.totalSpent
            : (a, b) => b.count - a.count;
        // Sort and get top 5
        const topClients = Object.values(clientCounts)
            .sort(sortFunction)
            .slice(0, 5)
            .map(item => ({
            nombre: `${item.client.nombre} ${item.client.apellido}`,
            email: item.client.email,
            citas: item.count,
            totalSpent: item.totalSpent
        }));
        res.json(topClients);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get top employees (most completed appointments) - ADMIN only
router.get('/top-employees', auth_middleware_1.authenticateToken, authorization_middleware_1.requireAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy } = req.query; // 'count' or 'revenue'
        const appointments = yield prisma_1.default.appointment.findMany({
            where: {
                estado: 'COMPLETADA',
                empleadoId: { not: null }
            },
            include: {
                empleado: true,
                servicio: true
            }
        });
        // Count by employee
        const employeeCounts = {};
        appointments.forEach(apt => {
            var _a;
            if (apt.empleado) {
                const id = apt.empleado.id;
                if (!employeeCounts[id]) {
                    employeeCounts[id] = { employee: apt.empleado, count: 0, totalGenerated: 0 };
                }
                employeeCounts[id].count++;
                if ((_a = apt.servicio) === null || _a === void 0 ? void 0 : _a.precio) {
                    employeeCounts[id].totalGenerated += Number(apt.servicio.precio);
                }
            }
        });
        // Sort by count or revenue
        const sortFunction = sortBy === 'revenue'
            ? (a, b) => b.totalGenerated - a.totalGenerated
            : (a, b) => b.count - a.count;
        // Sort and get top 5
        const topEmployees = Object.values(employeeCounts)
            .sort(sortFunction)
            .slice(0, 5)
            .map(item => ({
            nombre: `${item.employee.nombre} ${item.employee.apellido}`,
            especialidad: item.employee.especialidad,
            citas: item.count,
            totalGenerated: item.totalGenerated
        }));
        res.json(topEmployees);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
