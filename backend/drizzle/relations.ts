import { relations } from "drizzle-orm/relations";
import { users, documents, loans, payments } from "./schema";

export const documentsRelations = relations(documents, ({one}) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
	loan: one(loans, {
		fields: [documents.loanId],
		references: [loans.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	documents: many(documents),
	loans_userId: many(loans, {
		relationName: "loans_userId_users_id"
	}),
	loans_lenderId: many(loans, {
		relationName: "loans_lenderId_users_id"
	}),
}));

export const loansRelations = relations(loans, ({one, many}) => ({
	documents: many(documents),
	payments: many(payments),
	user_userId: one(users, {
		fields: [loans.userId],
		references: [users.id],
		relationName: "loans_userId_users_id"
	}),
	user_lenderId: one(users, {
		fields: [loans.lenderId],
		references: [users.id],
		relationName: "loans_lenderId_users_id"
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	loan: one(loans, {
		fields: [payments.loanId],
		references: [loans.id]
	}),
}));