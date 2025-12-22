
import db from './database';
import { loans, payments, documents } from './db/schema';

async function clearLoans() {
    console.log("Clearing loan data...");
    try {
        await db.delete(payments);
        await db.delete(documents);
        await db.delete(loans);
        console.log("Successfully deleted all loans, payments, and documents.");
    } catch (error) {
        console.error("Error clearing data:", error);
    }
    process.exit(0);
}

clearLoans();
