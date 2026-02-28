import { pgTable, foreignKey, uuid, text, timestamp, numeric, integer, boolean, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const documentType = pgEnum("document_type", ['ID', 'PROOF_OF_INCOME', 'BANK_STATEMENT', 'OTHER'])
export const loanStatus = pgEnum("loan_status", ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'AWAITING_CONFIRMATION'])
export const paymentMethod = pgEnum("payment_method", ['BANK_TRANSFER', 'MOBILE_PAYMENT', 'CASH'])
export const paymentStatus = pgEnum("payment_status", ['PENDING', 'COMPLETED', 'FAILED'])
export const userRole = pgEnum("user_role", ['USER', 'ADMIN', 'MODERATOR'])


export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	loanId: uuid("loan_id"),
	documentType: documentType("document_type").notNull(),
	fileUrl: text("file_url").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "documents_loan_id_loans_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	loanId: uuid("loan_id").notNull(),
	amountPaid: numeric("amount_paid", { precision: 10, scale:  2 }).notNull(),
	paymentMethod: paymentMethod("payment_method").notNull(),
	paymentDate: timestamp("payment_date", { mode: 'string' }).defaultNow(),
	status: paymentStatus().default('PENDING'),
	transactionReference: text("transaction_reference"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.loanId],
			foreignColumns: [loans.id],
			name: "payments_loan_id_loans_id_fk"
		}).onDelete("cascade"),
]);

export const loanOffers = pgTable("loan_offers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	minTermMonths: integer("min_term_months").notNull(),
	maxTermMonths: integer("max_term_months").notNull(),
	baseInterestRate: numeric("base_interest_rate", { precision: 5, scale:  2 }).notNull(),
	description: text().notNull(),
	active: boolean().default(true),
});

export const loans = pgTable("loans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	amountRequested: numeric("amount_requested", { precision: 10, scale:  2 }).notNull(),
	netAmount: numeric("net_amount", { precision: 10, scale:  2 }).notNull(),
	platformCommission: numeric("platform_commission", { precision: 10, scale:  2 }).notNull(),
	interestRate: numeric("interest_rate", { precision: 5, scale:  2 }).notNull(),
	termMonths: integer("term_months").notNull(),
	totalAmountDue: numeric("total_amount_due", { precision: 10, scale:  2 }).notNull(),
	status: loanStatus().default('PENDING'),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	lenderId: uuid("lender_id"),
	contractUrl: text("contract_url"),
	borrowerSignature: text("borrower_signature"),
	lenderSignature: text("lender_signature"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "loans_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lenderId],
			foreignColumns: [users.id],
			name: "loans_lender_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	phone: text(),
	fullName: text("full_name").notNull(),
	passwordHash: text("password_hash").notNull(),
	profilePictureUrl: text("profile_picture_url"),
	rating: numeric({ precision: 2, scale:  1 }).default('5.0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	documentNumber: text("document_number"),
	role: userRole().default('USER'),
	signatureUrl: text("signature_url"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_document_number_unique").on(table.documentNumber),
]);
