import db from '../database';
import { loans, loanOffers, users, payments, documents } from '../db/schema';
import { eq, desc, ne, and } from 'drizzle-orm';
import { z } from 'zod';
import axios from 'axios';


const loanRequestSchema = z.object({
    userId: z.string().uuid(),
    amountRequested: z.number().positive(),
    termMonths: z.number().int().positive(),
    interestRate: z.number().positive(),
    signatureBase64: z.string().optional(), // Base64 signature if signing new
    useSavedSignature: z.boolean().optional(), // True if using already saved signature
});

import { PDFService } from './pdf.service';
import { S3Service } from './s3.service';

export class LoanService {
    private pdfService = new PDFService();
    private s3Service = new S3Service();

    private async adjustUserRating(userId: string, delta: number) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) return;

        const currentRating = parseFloat(user.rating || '1.0');
        let newRating = currentRating + delta;

        // Limits: min 0.0, max 5.0
        newRating = Math.max(0, Math.min(5, newRating));

        await db.update(users)
            .set({ rating: newRating.toFixed(1) })
            .where(eq(users.id, userId));

        console.log(`User ${userId} rating adjusted by ${delta}. New rating: ${newRating.toFixed(1)}`);
    }

    private async getSignatureBase64(source: string): Promise<string> {
        if (source.startsWith('data:image')) {
            return source;
        }

        try {
            // If it's a URL, try to use S3 Service to get it (since it might be private)
            // Extract key from URL
            const { body, contentType } = await this.s3Service.getFile(source);

            if (!body) throw new Error("Could not get file body from S3");

            let buffer;
            if (body.pipe) {
                // Node stream
                const chunks: any[] = [];
                for await (const chunk of body) {
                    chunks.push(chunk);
                }
                buffer = Buffer.concat(chunks);
            } else if (typeof body.getReader === 'function') {
                // Web stream
                const reader = body.getReader();
                const chunks: any[] = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }
                buffer = Buffer.concat(chunks);
            } else {
                buffer = Buffer.from(body);
            }

            const base64 = buffer.toString('base64');
            return `data:image/${(contentType || 'png').split('/')[1]};base64,${base64}`;
        } catch (error) {
            console.error("Error fetching signature from R2 via S3 client:", error);
            return source;
        }
    }

    private async ensureUserSignature(userId: string, signatureBase64?: string, useSavedSignature?: boolean): Promise<string | null> {
        // Fetch user
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) return null;

        // If using saved signature and it exists, return it
        if (useSavedSignature && user.signatureUrl) {
            return user.signatureUrl;
        }

        // If providing new base64 signature
        if (signatureBase64) {
            // Check if we already have one saved and we just want to update or if it's new
            // For now, let's always save it to R2 if it's the first one or if we are overriding
            try {
                // Convert Base64 to Buffer
                const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');

                const fileName = `signatures/user_${userId}_${Date.now()}.png`;
                const signatureUrl = await this.s3Service.uploadFile(buffer, fileName, 'image/png');

                // Update user profile with this URL if they don't have one or if we are explicitly saving new
                await db.update(users).set({ signatureUrl }).where(eq(users.id, userId));

                return signatureUrl;
            } catch (error) {
                console.error("Error saving user signature to R2:", error);
                return null;
            }
        }

        return user.signatureUrl;
    }

    async createLoan(data: z.infer<typeof loanRequestSchema>) {
        const validated = loanRequestSchema.parse(data);
        const amountRequested = validated.amountRequested;
        const netAmount = amountRequested;

        const rates: Record<number, number> = { 1: 8, 2: 12, 3: 16, 4: 20 };
        const applicableRate = rates[validated.termMonths] || 20;

        const interestRateDecimal = applicableRate / 100;
        const totalInterest = amountRequested * interestRateDecimal;
        const totalAmountDue = amountRequested + totalInterest;
        const platformCommission = totalInterest;

        // Fetch user to check rating
        const userResult = await db.select().from(users).where(eq(users.id, validated.userId));
        const user = userResult[0];

        if (!user) {
            throw new Error("El usuario no existe. Por favor, cierra sesión y vuelve a entrar.");
        }

        // Limit validation for new users (rating <= 1.0)
        const userRating = parseFloat(user.rating || '1.0');
        if (userRating <= 1.0 && amountRequested > 100.00) {
            throw new Error("Tu límite de crédito actual es de S/ 100.00. Mejora tu puntuación realizando pagos puntuales para aumentar tu límite.");
        }

        const signatureUrl = await this.ensureUserSignature(validated.userId, validated.signatureBase64, validated.useSavedSignature);

        let contractUrl: string | null = null;
        if (signatureUrl) {
            try {
                const [user] = await db.select().from(users).where(eq(users.id, validated.userId));
                if (user) {
                    // Critical: Get base64 for PDF embedding
                    const pdfSignature = await this.getSignatureBase64(validated.signatureBase64 || signatureUrl);

                    const pdfBuffer = await this.pdfService.generateLoanContract({
                        borrowerName: user.fullName,
                        borrowerDni: user.documentNumber || 'N/A',
                        amount: amountRequested,
                        termWeeks: validated.termMonths,
                        totalToPay: totalAmountDue,
                        borrowerSignatureBase64: pdfSignature
                    });

                    const fileName = `contracts/contract_${validated.userId}_${Date.now()}.pdf`;
                    contractUrl = await this.s3Service.uploadFile(pdfBuffer, fileName, 'application/pdf');
                }
            } catch (error) {
                console.error("Error generating/uploading contract PDF:", error);
            }
        }

        const [newLoan] = await db.insert(loans).values({
            userId: validated.userId,
            amountRequested: amountRequested.toFixed(2),
            netAmount: netAmount.toFixed(2),
            platformCommission: platformCommission.toFixed(2),
            interestRate: applicableRate.toFixed(2),
            termMonths: validated.termMonths,
            totalAmountDue: totalAmountDue.toFixed(2),
            status: 'PENDING',
            contractUrl: contractUrl,
            borrowerSignature: validated.signatureBase64 || signatureUrl // Keep backwards compatibility if needed
        }).returning();

        return { loan: newLoan };
    }

    async getLoansByUser(userId: string, limit: number = 20, offset: number = 0) {
        const userLoans = await db.select().from(loans)
            .where(eq(loans.userId, userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(loans.createdAt));

        const enrichedBorrowed = await Promise.all(userLoans.map(async (loan) => {
            const loanPayments = await db.select()
                .from(payments)
                .where(eq(payments.loanId, loan.id));

            const completedPayments = loanPayments.filter(p => p.status === 'COMPLETED');
            const totalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
            const totalDue = parseFloat(loan.totalAmountDue);
            const remaining = Math.max(0, totalDue - totalPaid);

            const term = loan.termMonths || 1;
            const installmentAmount = (totalDue > 0) ? (totalDue / term) : 0;
            const paidInstallments = (installmentAmount > 0) ? Math.floor(totalPaid / installmentAmount) : (remaining === 0 && totalDue > 0 ? term : 0);

            return {
                ...loan,
                paymentProgress: {
                    totalPaid: totalPaid.toFixed(2),
                    remaining: remaining.toFixed(2),
                    paidInstallments,
                    totalInstallments: term,
                    pendingConfirmations: loanPayments.filter(p => p.status === 'PENDING').length,
                    completedPayments: completedPayments.length
                }
            };
        }));

        const lent = await db.select()
            .from(loans)
            .where(eq(loans.lenderId, userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(loans.createdAt));

        return { borrowed: enrichedBorrowed, lent };
    }

    async getLoansByLender(lenderId: string) {
        return await db.select().from(loans).where(eq(loans.lenderId, lenderId));
    }

    async getPendingLoans(currentUserId?: string, limit: number = 20, offset: number = 0) {
        return await db.select({
            id: loans.id,
            amountRequested: loans.amountRequested,
            totalAmountDue: loans.totalAmountDue,
            termMonths: loans.termMonths,
            status: loans.status,
            createdAt: loans.createdAt,
            userId: loans.userId,
            documentNumber: users.documentNumber,
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
            .limit(limit)
            .offset(offset)
            .orderBy(desc(loans.createdAt));
    }

    async getLoanById(id: string) {
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
            borrowerDni: users.documentNumber,
            borrowerPhone: users.phone,
            borrowerRating: users.rating,
            contractUrl: loans.contractUrl
        })
            .from(loans)
            .leftJoin(users, eq(loans.userId, users.id))
            .where(eq(loans.id, id));

        if (!loanResult[0]) return null;

        const loan = loanResult[0];

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

    async fundLoan(loanId: string, lenderId: string, signatureBase64?: string, useSavedSignature?: boolean) {
        // First check if loan exists and is pending
        const [existingLoan] = await db.select().from(loans).where(eq(loans.id, loanId));

        if (!existingLoan) {
            return null;
        }

        if (existingLoan.userId === lenderId) {
            throw new Error("No puedes financiar tu propia solicitud de préstamo.");
        }

        if (existingLoan.status !== 'PENDING') {
            throw new Error(`Este préstamo ya no está disponible (Estado: ${existingLoan.status}).`);
        }

        // Handle logical signature for lender
        const lenderSignatureUrl = await this.ensureUserSignature(lenderId, signatureBase64, useSavedSignature);

        let contractUrl = existingLoan.contractUrl;

        // Regenerate contract with lender signature if available
        if (lenderSignatureUrl && existingLoan.borrowerSignature) {
            try {
                const [borrower] = await db.select().from(users).where(eq(users.id, existingLoan.userId));
                const [lender] = await db.select().from(users).where(eq(users.id, lenderId));

                if (borrower && lender) {
                    // Critical: Get base64 for PDF embedding (borrower might have URL now)
                    const borrowerSigBase64 = await this.getSignatureBase64(existingLoan.borrowerSignature || '');
                    const lenderSigBase64 = await this.getSignatureBase64(signatureBase64 || lenderSignatureUrl || '');

                    const pdfBuffer = await this.pdfService.generateLoanContract({
                        borrowerName: borrower.fullName,
                        borrowerDni: borrower.documentNumber || 'N/A',
                        lenderName: lender.fullName,
                        lenderDni: lender.documentNumber || 'N/A',
                        amount: parseFloat(existingLoan.amountRequested),
                        termWeeks: existingLoan.termMonths,
                        totalToPay: parseFloat(existingLoan.totalAmountDue),
                        borrowerSignatureBase64: borrowerSigBase64,
                        lenderSignatureBase64: lenderSigBase64
                    });

                    const fileName = `contracts/contract_final_${loanId}_${Date.now()}.pdf`;
                    contractUrl = await this.s3Service.uploadFile(pdfBuffer, fileName, 'application/pdf');
                }
            } catch (error) {
                console.error("Error regenerating final contract PDF:", error);
            }
        }

        const [updatedLoan] = await db.update(loans)
            .set({
                status: 'AWAITING_CONFIRMATION',
                lenderId: lenderId,
                lenderSignature: signatureBase64 || lenderSignatureUrl,
                contractUrl: contractUrl
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


    async getContractFile(loanId: string) {
        const loan = await this.getLoanById(loanId);
        if (!loan || !loan.contractUrl) {
            throw new Error("Contrato no encontrado para este préstamo.");
        }

        return await this.s3Service.getFile(loan.contractUrl);
    }

    async rejectLoan(loanId: string) {
        const [existingLoan] = await db.select().from(loans).where(eq(loans.id, loanId));

        const [updatedLoan] = await db.update(loans)
            .set({
                status: 'PENDING',
                lenderId: null
            })
            .where(eq(loans.id, loanId))
            .returning();

        return {
            ...updatedLoan,
            previousLenderId: existingLoan?.lenderId
        };
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

        // If fully paid, mark as COMPLETED
        if (totalPaid >= totalDue && loan.status !== 'COMPLETED') {
            const [updatedLoan] = await db.update(loans)
                .set({ status: 'COMPLETED' })
                .where(eq(loans.id, loanId))
                .returning();

            console.log(`Loan ${loanId} marked as COMPLETED!`);

            // Check for volume bonus: +1.0 rating if cumulative completed loans reach S/ 500
            const userLoans = await db.select().from(loans).where(and(eq(loans.userId, loan.userId), eq(loans.status, 'COMPLETED')));
            const totalVolume = userLoans.reduce((sum, l) => sum + parseFloat(l.amountRequested), 0);

            // Logic: if current loan pushed it over 500, and it hasn't been rewarded before 
            // (or simpler: if totalVolume is between 500 and 500 + currentAmount)
            // To be precise and avoid double rewards, we could check a flag, 
            // but for now let's use the 500 threshold as requested.
            const previousVolume = totalVolume - parseFloat(loan.amountRequested);
            if (previousVolume < 500 && totalVolume >= 500) {
                await this.adjustUserRating(loan.userId, 1.0);
            }

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
            // Logic for rating reduction based on delay
            const [loan] = await db.select().from(loans).where(eq(loans.id, payment.loanId));
            if (loan && loan.approvedAt) {
                const now = new Date();
                const approvedDate = new Date(loan.approvedAt);

                // For simplicity, we assume the first payment is due 7 days after approvedAt, 
                // the second 14 days, and so on.
                // We calculate how many payments exist to know which installment this is.
                const allPayments = await db.select().from(payments).where(eq(payments.loanId, loan.id));
                const completedCount = allPayments.filter(p => p.status === 'COMPLETED').length;

                // Due date for THIS installment: approvedAt + (completedCount * 7 days)
                const dueDate = new Date(approvedDate);
                dueDate.setDate(dueDate.getDate() + (completedCount * 7));

                const diffTime = now.getTime() - dueDate.getTime();
                const diffDaysRaw = diffTime / (1000 * 60 * 60 * 24);
                const diffDays = Math.floor(diffDaysRaw);

                if (diffDays >= 2) {
                    await this.adjustUserRating(loan.userId, -1.0);
                } else if (diffDays >= 1) {
                    await this.adjustUserRating(loan.userId, -0.5);
                }
            }

            // Check if loan is now fully paid
            await this.checkAndCompleteLoan(payment.loanId);
        }

        return payment;
    }

    async rejectPayment(paymentId: string) {
        // Mark payment as FAILED - lender says they didn't receive the money
        const [payment] = await db.update(payments)
            .set({ status: 'FAILED' })
            .where(eq(payments.id, paymentId))
            .returning();

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

