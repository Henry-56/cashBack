
import db from './database';
import { loans, users } from './db/schema';
import { eq } from 'drizzle-orm';

async function createMarketLoans() {
    console.log("Generating marketplace loans...");

    // 1. Get or Create Borrowers
    // We'll try to find the test user, and maybe create a second one "Alice"
    let [testUser] = await db.select().from(users).where(eq(users.email, 'test@example.com'));

    if (!testUser) {
        console.log("Test user not found, creating...");
        // This part assumes you have bcrypt, but for quick seed we might skip or reuse seed logic
        // Let's assume seed.ts was run and testUser exists. If not, script fails/exits.
        console.error("Please run seed.ts first to create test user.");
        process.exit(1);
    }

    // Create a second user to be the "other" borrower
    const otherEmail = 'alice@example.com';
    let [alice] = await db.select().from(users).where(eq(users.email, otherEmail));

    if (!alice) {
        console.log("Creating Alice...");
        const [newUser] = await db.insert(users).values({
            email: otherEmail,
            fullName: 'Alice Wonderland',
            passwordHash: 'placeholder', // Not needed for market display
            phone: '987654321',
            rating: '4.5'
        }).returning();
        alice = newUser;
    }

    // 2. Create Loans
    const newLoans = [
        {
            userId: testUser.id,
            amountRequested: '100.00',
            termMonths: 1, // weeks
            reason: 'Emergencia médica',
            totalAmountDue: '110.00',
            netAmount: '100.00',
            platformCommission: '5.00',
            interestRate: '10.00',
            status: 'PENDING' as const
        },
        {
            userId: alice.id,
            amountRequested: '200.00',
            termMonths: 2,
            reason: 'Compra de insumos',
            totalAmountDue: '220.00',
            netAmount: '200.00',
            platformCommission: '10.00',
            interestRate: '10.00',
            status: 'PENDING' as const
        },
        {
            userId: alice.id,
            amountRequested: '500.00',
            termMonths: 4,
            reason: 'Capital de trabajo',
            totalAmountDue: '550.00',
            netAmount: '500.00',
            platformCommission: '25.00',
            interestRate: '10.00',
            status: 'PENDING' as const
        }
    ];

    for (const loan of newLoans) {
        await db.insert(loans).values(loan);
    }

    console.log(`Created ${newLoans.length} new pending loans.`);
    process.exit(0);
}

createMarketLoans();
