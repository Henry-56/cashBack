
import db from './database';
import { loans } from './db/schema';
import { eq } from 'drizzle-orm';

async function reproduce() {
    const lenderId = '1aa367aa-43ca-4813-b051-5f32e3a144d6'; // Henry (from previous step)
    const loanId = 'ceb1fd57-b82e-4d1d-aa13-2191421f3cdc'; // Loan from screenshot

    console.log(`Attempting to fund Loan ${loanId} by Lender ${lenderId}...`);

    try {
        const result = await db.update(loans)
            .set({
                status: 'AWAITING_CONFIRMATION',
                lenderId: lenderId
            })
            .where(eq(loans.id, loanId))
            .returning();

        console.log("Success:", result);
    } catch (error) {
        console.error("Caught Error:", error);
    }
    process.exit(0);
}

reproduce();
