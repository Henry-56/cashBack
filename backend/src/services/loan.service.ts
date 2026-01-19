import db from '../database';
import { loans, loanOffers, users, payments, documents } from '../db/schema';
import { eq, desc, ne, and } from 'drizzle-orm';
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

        // Calculate total due based on fixed rates per term (weeks)
        const rates: Record<number, number> = { 1: 8, 2: 12, 3: 16, 4: 20 };
        const applicableRate = rates[validated.termMonths] || 20; // Default to 20% if unknown term

        const interestRateDecimal = applicableRate / 100;
        const totalInterest = amountRequested * interestRateDecimal;
        const totalAmountDue = amountRequested + totalInterest;

        // Platform gain is the interest
        const platformCommission = totalInterest;

        const [newLoan] = await db.insert(loans).values({
            userId: validated.userId,
            amountRequested: amountRequested.toFixed(2),
            netAmount: netAmount.toFixed(2),
            platformCommission: platformCommission.toFixed(2),
            interestRate: applicableRate.toFixed(2),
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
        const userLoans = await db.select().from(loans).where(eq(loans.userId, userId));

        // Enrich each loan with payment progress
        const enrichedLoans = await Promise.all(userLoans.map(async (loan) => {
            const loanPayments = await db.select()
                .from(payments)
                .where(eq(payments.loanId, loan.id));

            const completedPayments = loanPayments.filter(p => p.status === 'COMPLETED');
            const pendingPayments = loanPayments.filter(p => p.status === 'PENDING');
            const totalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
            const totalDue = parseFloat(loan.totalAmountDue);
            const remaining = Math.max(0, totalDue - totalPaid);

            // Calculate installment info
            const installmentAmount = totalDue / loan.termMonths;
            const paidInstallments = Math.floor(totalPaid / installmentAmount);
            const totalInstallments = loan.termMonths;

            return {
                ...loan,
                paymentProgress: {
                    totalPaid: totalPaid.toFixed(2),
                    remaining: remaining.toFixed(2),
                    paidInstallments,
                    totalInstallments,
                    pendingConfirmations: pendingPayments.length,
                    completedPayments: completedPayments.length
                }
            };
        }));

        return enrichedLoans;
    }

    async getLoansByLender(lenderId: string) {
        return await db.select().from(loans).where(eq(loans.lenderId, lenderId));
    }

    async getPendingLoans(currentUserId?: string) {
        return await db.select({
            id: loans.id,
            amountRequested: loans.amountRequested,
            totalAmountDue: loans.totalAmountDue,
            termMonths: loans.termMonths,
            status: loans.status,
            createdAt: loans.createdAt,
            userId: loans.userId,
            user: {
                fullName: users.fullName,
                rating: users.rating,
            }
        })
            .from(loans)
            .leftJoin(users, eq(loans.userId, users.id))
            .where(
                and(
                    eq(loans.status, 'PENDING'),
                    currentUserId ? ne(loans.userId, currentUserId) : undefined
                )
            )
            .orderBy(desc(loans.createdAt));
    }

    async getLoanById(id: string) {
        // First get the loan with borrower info
        const loanResult = await db.select({
            id: loans.id,
            amountRequested: loans.amountRequested,
            totalAmountDue: loans.totalAmountDue,
            termMonths: loans.termMonths,
            status: loans.status,
            createdAt: loans.createdAt,
            userId: loans.userId,
            lenderId: loans.lenderId,
            borrowerName: users.fullName,
            borrowerPhone: users.phone
        })
            .from(loans)
            .leftJoin(users, eq(loans.userId, users.id))
            .where(eq(loans.id, id));

        if (!loanResult[0]) return null;

        const loan = loanResult[0];

        // If there's a lender, get their info
        let lenderInfo = null;
        if (loan.lenderId) {
            const lenderResult = await db.select({
                fullName: users.fullName,
                phone: users.phone
            })
                .from(users)
                .where(eq(users.id, loan.lenderId));
            lenderInfo = lenderResult[0] || null;
        }

        return {
            ...loan,
            lenderName: lenderInfo?.fullName || null,
            lenderPhone: lenderInfo?.phone || null
        };
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

    async registerPayment(loanId: string, amount: number, proofUrl: string) {
        // 1. Create Payment Record
        const [payment] = await db.insert(payments).values({
            loanId,
            amountPaid: amount.toFixed(2),
            paymentMethod: 'BANK_TRANSFER', // Default for now as per user flow
            status: 'PENDING',
            transactionReference: 'PROOF_UPLOADED' // Marker
        }).returning();

        // 2. Store Document (Proof)
        if (proofUrl) {
            await db.insert(documents).values({
                loanId,
                documentType: 'BANK_STATEMENT', // Using best fit enum
                fileUrl: proofUrl,
                // userId: we could fetch it from loan but optional here
            });
        }

        // 3. Check if loan is fully paid and mark as COMPLETED
        await this.checkAndCompleteLoan(loanId);

        return payment;
    }

    async checkAndCompleteLoan(loanId: string) {
        // Get the loan details
        const [loan] = await db.select().from(loans).where(eq(loans.id, loanId));
        if (!loan) return null;

        // Get all COMPLETED payments for this loan
        const allPayments = await db.select()
            .from(payments)
            .where(eq(payments.loanId, loanId));

        // Sum up all completed payments
        const totalPaid = allPayments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);

        const totalDue = parseFloat(loan.totalAmountDue);

        console.log(`Loan ${loanId}: Paid ${totalPaid} / ${totalDue}`);

        // If fully paid, mark as COMPLETED
        if (totalPaid >= totalDue) {
            const [updatedLoan] = await db.update(loans)
                .set({ status: 'COMPLETED' })
                .where(eq(loans.id, loanId))
                .returning();

            console.log(`Loan ${loanId} marked as COMPLETED!`);
            return updatedLoan;
        }

        return null;
    }

    async confirmPayment(paymentId: string) {
        // Mark payment as COMPLETED
        const [payment] = await db.update(payments)
            .set({ status: 'COMPLETED' })
            .where(eq(payments.id, paymentId))
            .returning();

        if (payment) {
            // Check if loan is now fully paid
            await this.checkAndCompleteLoan(payment.loanId);
        }

        return payment;
    }

    async getPendingPaymentsForLender(lenderId: string) {
        // Get all loans where this user is the lender
        const lenderLoans = await db.select({
            loanId: loans.id,
            amountRequested: loans.amountRequested,
            totalAmountDue: loans.totalAmountDue,
            borrowerId: loans.userId,
            borrowerName: users.fullName
        })
            .from(loans)
            .leftJoin(users, eq(loans.userId, users.id))
            .where(eq(loans.lenderId, lenderId));

        if (lenderLoans.length === 0) return [];

        const loanIds = lenderLoans.map(l => l.loanId);

        // Get pending payments for those loans
        const pendingPayments = await db.select()
            .from(payments)
            .where(eq(payments.status, 'PENDING'));

        // Filter to only payments for lender's loans and enrich with loan info
        const enrichedPayments = pendingPayments
            .filter(p => loanIds.includes(p.loanId))
            .map(p => {
                const loan = lenderLoans.find(l => l.loanId === p.loanId);
                return {
                    ...p,
                    borrowerName: loan?.borrowerName || 'Usuario',
                    loanTotal: loan?.totalAmountDue
                };
            });

        return enrichedPayments;
    }
}

