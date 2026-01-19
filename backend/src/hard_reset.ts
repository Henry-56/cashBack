
import db from './database';
import { users, loans, payments, documents, loanOffers } from './db/schema';
import { sql } from 'drizzle-orm';

async function hardReset() {
    console.log("Starting HARD reset (WIPING ALL DATA)...");
    try {
        // Delete in order of foreign key dependencies
        await db.delete(payments);
        await db.delete(documents);
        await db.delete(loanOffers);
        await db.delete(loans);
        await db.delete(users);

        console.log("ALL Data cleared (Users, Loans, Payments, Documents, Offers).");
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

hardReset();
