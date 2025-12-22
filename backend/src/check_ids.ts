
import db from './database';
import { users, loans } from './db/schema';
import { eq } from 'drizzle-orm';

async function checkIds() {
    const lenderId = '1aa367aa-43ca-4813-b051-5f32e3a144d6';
    const loanId = 'ceb1fd57-b82e-4d1d-aa13-2191421f3cdc';

    console.log(`Checking Lender ID: ${lenderId}`);
    const lender = await db.select().from(users).where(eq(users.id, lenderId));
    console.log("Lender found:", lender.length > 0 ? "YES" : "NO");

    console.log(`Checking Loan ID: ${loanId}`);
    const loan = await db.select().from(loans).where(eq(loans.id, loanId));
    console.log("Loan found:", loan.length > 0 ? "YES" : "NO");

    if (loan.length > 0) {
        console.log("Loan Status:", loan[0].status);
        console.log("Loan Borrower ID:", loan[0].userId);
    }

    // Also list ALL users to see who is actually there
    const allUsers = await db.select().from(users);
    console.log("\n--- ACTUAL USERS IN DB ---");
    allUsers.forEach(u => console.log(`${u.fullName} (${u.email}): ${u.id}`));

    process.exit(0);
}

checkIds();
