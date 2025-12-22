import db from '../database';
import { loans, loanOffers, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const loanRequestSchema = z.object({
    userId: z.string().uuid(),
    amountRequested: z.number().positive(),
    termMonths: z.number().int().positive(),
    interestRate: z.number().positive(),
});

export class LoanService {
    async createLoan(data: z.infer<typeof loanRequestSchema>) {
        const validated = loanRequestSchema.parse(data);

        // NEW LOGIC: Borrower receives full amount. Interest is added on top.
        // Interest varies 2-5% based on weeks (handled by frontend passing the rate, but we can validate/recalc).
        // Frontend sends: amountRequested, termMonths (actually weeks 1-4), interestRate

        const amountRequested = validated.amountRequested;
        const netAmount = amountRequested; // No commission deducted from received amount

        // Calculate total due based on the provided interest rate (flat rate for the period)
        const interestRateDecimal = validated.interestRate / 100;
        const totalInterest = amountRequested * interestRateDecimal;
        const totalAmountDue = amountRequested + totalInterest;

        // Platform gain is the interest
        const platformCommission = totalInterest;

        const [newLoan] = await db.insert(loans).values({
            userId: validated.userId,
            amountRequested: amountRequested.toFixed(2),
            netAmount: netAmount.toFixed(2),
            platformCommission: platformCommission.toFixed(2),
            interestRate: validated.interestRate.toFixed(2),
            termMonths: validated.termMonths, // Storing weeks in this column for now
            totalAmountDue: totalAmountDue.toFixed(2),
            status: 'PENDING',
        }).returning();

        return {
            loan: newLoan,
            breakdown: {
                requested: amountRequested,
                commission: 0, // No upfront commission deduction
                netReceived: netAmount,
                totalToPay: totalAmountDue,
                interestGenerated: totalInterest
            }
        };
    }

    async getLoansByUser(userId: string) {
        return await db.select().from(loans).where(eq(loans.userId, userId));
    }

    async getLoansByLender(lenderId: string) {
        return await db.select().from(loans).where(eq(loans.lenderId, lenderId));
    }

    async getPendingLoans() {
        // Fetch all pending loans for the marketplace
        // In a real app, we might join with Users to get the requester name
        return await db.select().from(loans).where(eq(loans.status, 'PENDING'));
    }

    async getLoanById(id: string) {
        const result = await db.select({
            id: loans.id,
            amountRequested: loans.amountRequested,
            totalAmountDue: loans.totalAmountDue,
            termMonths: loans.termMonths,
            status: loans.status,
            createdAt: loans.createdAt,
            userId: loans.userId,
            borrowerName: users.fullName
        })
            .from(loans)
            .leftJoin(users, eq(loans.userId, users.id))
            .where(eq(loans.id, id));

        return result[0];
    }

    async fundLoan(loanId: string, lenderId: string) {
        // First check if loan exists and is pending
        const [existingLoan] = await db.select().from(loans).where(eq(loans.id, loanId));

        if (!existingLoan) {
            return null; // Controller will handle 404
        }

        if (existingLoan.userId === lenderId) {
            throw new Error("No puedes financiar tu propia solicitud de préstamo.");
        }

        if (existingLoan.status !== 'PENDING') {
            throw new Error(`Este préstamo ya no está disponible (Estado: ${existingLoan.status}).`);
        }

        const [updatedLoan] = await db.update(loans)
            .set({
                status: 'AWAITING_CONFIRMATION', // Changed from ACTIVE
                lenderId: lenderId,
                // approvedAt is not set yet, wait for confirmation
            })
            .where(eq(loans.id, loanId))
            .returning();

        return updatedLoan;
    }

    async confirmLoan(loanId: string) {
        const [updatedLoan] = await db.update(loans)
            .set({
                status: 'ACTIVE',
                approvedAt: new Date() // Now it is officially active
            })
            .where(eq(loans.id, loanId))
            .returning();
        return updatedLoan;
    }

    async rejectLoan(loanId: string) {
        const [updatedLoan] = await db.update(loans)
            .set({
                status: 'PENDING', // Revert to pending so others can lend? Or REJECTED? 
                // Let's revert to PENDING so it goes back to marketplace
                lenderId: null
            })
            .where(eq(loans.id, loanId))
            .returning();
        return updatedLoan;
    }
}
