
import db from './database';
import { sql } from 'drizzle-orm';

async function fixEnum() {
    console.log("Fixing enum...");
    try {
        await db.execute(sql`ALTER TYPE loan_status ADD VALUE IF NOT EXISTS 'AWAITING_CONFIRMATION'`);
        console.log("Enum updated successfully.");
    } catch (error) {
        console.error("Error updating enum:", error);
    }
    process.exit(0);
}

fixEnum();
