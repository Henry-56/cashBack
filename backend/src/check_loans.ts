
import db from './database';
import { loans } from './db/schema';
import { eq } from 'drizzle-orm';

async function checkLoans() {
    const allLoans = await db.select().from(loans);
    console.log(`Total loans: ${allLoans.length}`);
    const pending = await db.select().from(loans).where(eq(loans.status, 'PENDING'));
    console.log(`Pending loans: ${pending.length}`);
    process.exit(0);
}

checkLoans();
