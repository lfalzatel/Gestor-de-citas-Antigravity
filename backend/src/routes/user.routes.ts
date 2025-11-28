import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Get all users (clients) - Admin/Employee only ideally
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        // In a real app, filter by role or check admin permissions
        const users = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: { id: true, name: true, email: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
