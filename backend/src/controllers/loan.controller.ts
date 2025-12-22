import { Request, Response } from 'express';
import { LoanService } from '../services/loan.service';

const loanService = new LoanService();

import { getIO } from '../socket';
import db from '../database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createLoan = async (req: Request, res: Response) => {
    try {
        // Basic User ID injection from Auth middleware (mocked for now or extracted from token)
        // In real app, req.user.id would be set by middleware
        const userId = req.body.userId; // Expecting frontend to send for now, or extracted from token

        const result = await loanService.createLoan({
            ...req.body,
            userId
        });

        // Fetch user name for notification
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        const userName = user ? user.fullName : "Un usuario";

        // Broadcast notification
        getIO().emit('new_loan_request', {
            message: `${userName} ha solicitado un préstamo de S/. ${req.body.amountRequested}`,
            amount: req.body.amountRequested,
            user: userName,
            userId: userId, // Added for filtering
            id: result.loan.id, // Critical: Send real loan ID
            timestamp: new Date()
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMyLoans = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string; // Temp: pass via query or body
        if (!userId) throw new Error("User ID required");

        const [borrowed, lent] = await Promise.all([
            loanService.getLoansByUser(userId),
            loanService.getLoansByLender(userId)
        ]);

        res.json({ borrowed, lent });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getMarketplaceLoans = async (req: Request, res: Response) => {
    try {
        const loans = await loanService.getPendingLoans();
        res.json(loans);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const fundLoan = async (req: Request, res: Response) => {
    try {
        console.log("Funding Loan Request - Params:", req.params);
        console.log("Funding Loan Request - Body:", req.body);
        const { id } = req.params;
        const { lenderId } = req.body; // In real app, from req.user.id

        if (!lenderId) throw new Error("Lender ID required");

        const loan = await loanService.fundLoan(id, lenderId);

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        // Notify borrower
        // We need to fetch borrower info or just emit event and have frontend filter
        // Ideally we join user to get borrower name, but for now just emit generic message
        getIO().emit('loan_funded', {
            loanId: loan.id,
            borrowerId: loan.userId,
            amount: loan.amountRequested,
            message: `¡Tu préstamo de S/. ${loan.amountRequested} ha sido financiado!`
        });

        res.json(loan);
    } catch (error: any) {
        console.error("Fund Loan Error:", error);
        res.status(400).json({ error: error.message });
    }
};

export const getLoanById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const loan = await loanService.getLoanById(id);
        if (!loan) return res.status(404).json({ error: "Loan not found" });
        res.json(loan);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const confirmLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const loan = await loanService.confirmLoan(id);
        res.json(loan);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const rejectLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const loan = await loanService.rejectLoan(id);
        res.json(loan);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
