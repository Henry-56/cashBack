import { Request, Response } from 'express';
import db from '../database';
import { loans, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { cleanError } from '../utils/error.utils';

export const getAllLoans = async (req: Request, res: Response) => {
    try {
        const allLoans = await db.select({
            id: loans.id,
            amount: loans.amountRequested,
            status: loans.status,
            contractUrl: loans.contractUrl,
            borrowerName: users.fullName,
            createdAt: loans.createdAt
        })
            .from(loans)
            .leftJoin(users, eq(loans.userId, users.id))
            .orderBy(desc(loans.createdAt));

        res.json(allLoans);
    } catch (error: any) {
        res.status(500).json({ error: cleanError(error) });
    }
};

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const allUsers = await db.select().from(users);
        res.json({
            totalUsers: allUsers.length,
            admins: allUsers.filter(u => u.role === 'ADMIN').length
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
