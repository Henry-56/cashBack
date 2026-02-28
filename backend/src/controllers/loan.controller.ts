import { Request, Response } from 'express';
import { LoanService } from '../services/loan.service';

const loanService = new LoanService();

import { getIO } from '../socket';
import db from '../database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { cleanError } from '../utils/error.utils';

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
        if (error.name === "ZodError") {
            console.error("Validation Error in createLoan:", JSON.stringify(error.errors, null, 2));
        } else {
            console.error("Error in createLoan:", error);
        }
        res.status(400).json({ error: cleanError(error) });
    }
};

export const getMyLoans = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!userId) throw new Error("User ID required");

        const data = await loanService.getLoansByUser(userId, limit, offset);
        res.json(data);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const getMarketplaceLoans = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string | undefined;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const loans = await loanService.getPendingLoans(userId, limit, offset);
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
        const { lenderId, signatureBase64, useSavedSignature } = req.body; // In real app, from req.user.id

        if (!lenderId) throw new Error("Lender ID required");

        const loan = await loanService.fundLoan(id, lenderId, signatureBase64, useSavedSignature);

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
        res.status(400).json({ error: cleanError(error) });
    }
};

export const getLoanById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const loan = await loanService.getLoanById(id);
        if (!loan) return res.status(404).json({ error: "Loan not found" });
        res.json(loan);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const confirmLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const loan = await loanService.confirmLoan(id);

        if (loan && loan.lenderId) {
            getIO().emit('loan_active', {
                targetUserId: loan.lenderId,
                loanId: loan.id,
                message: `¡El prestatario ha confirmado la recepción del dinero! El préstamo #${loan.id.slice(0, 6)} ya está activo y generando intereses.`
            });
        }

        res.json(loan);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const rejectLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await loanService.rejectLoan(id);

        if (result && result.previousLenderId) {
            getIO().emit('loan_lending_rejected', {
                targetUserId: result.previousLenderId,
                loanId: id,
                message: `El prestatario ha indicado que no recibió los fondos para el préstamo #${id.slice(0, 6)}. La solicitud ha vuelto al mercado.`
            });
        }
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const registerPayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, proofUrl } = req.body;

        const payment = await loanService.registerPayment(id, amount, proofUrl);

        // Notify Lender
        // Need to fetch lender ID to target notification?
        // Or just emit to everyone? NO.
        // Let's fetch the loan to get the lenderId
        const loan = await loanService.getLoanById(id);

        if (loan && loan.lenderId) { // Check if lender exists (should exist for active loan)
            // Use db directly or service to get lender details?
            // "getIO().to(socketId)..." but we don't have socketId map easily available unless we implemented room logic.
            // But we can emit 'payment_received' with lenderId in payload, and frontend filters.

            getIO().emit('payment_received', {
                targetUserId: loan.lenderId, // Frontend must filter by this
                loanId: id,
                amount: amount,
                message: `Se ha registrado un pago de S/. ${amount} para el préstamo #${id.slice(0, 6)}`
            });
        }

        res.json(payment);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const confirmPayment = async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;
        const payment = await loanService.confirmPayment(paymentId);

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        // Check if loan was completed
        const loan = await loanService.getLoanById(payment.loanId);

        if (loan && loan.status === 'COMPLETED') {
            getIO().emit('loan_completed', {
                loanId: loan.id,
                borrowerId: loan.userId,
                lenderId: loan.lenderId,
                message: `¡El préstamo ha sido pagado completamente!`
            });
        }

        res.json({ payment, loanCompleted: loan?.status === 'COMPLETED' });
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const getPendingPaymentsForLender = async (req: Request, res: Response) => {
    try {
        const lenderId = req.query.lenderId as string;
        if (!lenderId) throw new Error("Lender ID required");

        const pendingPayments = await loanService.getPendingPaymentsForLender(lenderId);
        res.json(pendingPayments);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const rejectPayment = async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;
        const payment = await loanService.rejectPayment(paymentId);

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        // Notify borrower that their payment was rejected
        const loan = await loanService.getLoanById(payment.loanId);
        if (loan) {
            getIO().emit('payment_rejected', {
                targetUserId: loan.userId,
                loanId: payment.loanId,
                amount: payment.amountPaid,
                message: `Tu pago de S/. ${payment.amountPaid} fue rechazado. El prestamista indica que no recibió el dinero.`
            });
        }

        res.json({ payment, message: 'Pago rechazado' });
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const downloadContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to download contract for loan: ${id}`);
        const { body, contentType } = await loanService.getContractFile(id);

        if (!body) {
            console.error(`Contract file body is empty for loan ${id}`);
            return res.status(404).json({ error: "Archivo de contrato no encontrado." });
        }

        const actualContentType = contentType || 'application/pdf';
        const fileName = `contrato_${id.slice(0, 8)}.pdf`;

        console.log(`Serving contract: ${fileName} with type ${actualContentType}`);

        // Set headers for PDF download
        res.setHeader('Content-Type', actualContentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        // Handle both Node.js Readable streams and Web ReadableStreams
        if (body.pipe) {
            body.pipe(res);
        } else if (typeof body.getReader === 'function') {
            const reader = body.getReader();
            const processStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                }
                res.end();
            };
            processStream().catch(err => {
                console.error("Stream reading error:", err);
                if (!res.headersSent) res.status(500).end();
            });
        } else {
            res.send(body);
        }
    } catch (error: any) {
        console.error("Error in downloadContract controller:", error);
        if (!res.headersSent) {
            res.status(400).json({ error: error.message });
        }
    }
};
