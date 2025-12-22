import { pgTable, uuid, text, decimal, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const loanStatusEnum = pgEnum('loan_status', ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'AWAITING_CONFIRMATION']);
export const paymentMethodEnum = pgEnum('payment_method', ['BANK_TRANSFER', 'MOBILE_PAYMENT', 'CASH']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'COMPLETED', 'FAILED']);
export const documentTypeEnum = pgEnum('document_type', ['ID', 'PROOF_OF_INCOME', 'BANK_STATEMENT', 'OTHER']);

// Users Table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').unique().notNull(),
    phone: text('phone'),
    fullName: text('full_name').notNull(),
    passwordHash: text('password_hash').notNull(),
    profilePictureUrl: text('profile_picture_url'),
    rating: decimal('rating', { precision: 2, scale: 1 }).default('5.0'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Loans Table
export const loans = pgTable('loans', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    lenderId: uuid('lender_id').references(() => users.id), // Nullable, set when funded
    amountRequested: decimal('amount_requested', { precision: 10, scale: 2 }).notNull(),
    netAmount: decimal('net_amount', { precision: 10, scale: 2 }).notNull(),
    platformCommission: decimal('platform_commission', { precision: 10, scale: 2 }).notNull(),
    interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
    termMonths: integer('term_months').notNull(),
    totalAmountDue: decimal('total_amount_due', { precision: 10, scale: 2 }).notNull(),
    status: loanStatusEnum('status').default('PENDING'),
    approvedAt: timestamp('approved_at'),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Payments Table
export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    loanId: uuid('loan_id').references(() => loans.id, { onDelete: 'cascade' }).notNull(),
    amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    paymentDate: timestamp('payment_date').defaultNow(),
    status: paymentStatusEnum('status').default('PENDING'),
    transactionReference: text('transaction_reference'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Documents Table
export const documents = pgTable('documents', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    loanId: uuid('loan_id').references(() => loans.id),
    documentType: documentTypeEnum('document_type').notNull(),
    fileUrl: text('file_url').notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// Loan Offers Table
export const loanOffers = pgTable('loan_offers', {
    id: uuid('id').defaultRandom().primaryKey(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    minTermMonths: integer('min_term_months').notNull(),
    maxTermMonths: integer('max_term_months').notNull(),
    baseInterestRate: decimal('base_interest_rate', { precision: 5, scale: 2 }).notNull(),
    description: text('description').notNull(),
    active: boolean('active').default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    loans: many(loans),
    documents: many(documents),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
    user: one(users, {
        fields: [loans.userId],
        references: [users.id],
    }),
    payments: many(payments),
    documents: many(documents),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    loan: one(loans, {
        fields: [payments.loanId],
        references: [loans.id],
    }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    user: one(users, {
        fields: [documents.userId],
        references: [users.id],
    }),
    loan: one(loans, {
        fields: [documents.loanId],
        references: [loans.id],
    }),
}));
