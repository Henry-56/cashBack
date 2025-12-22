
import db from './database';
import { users, loans, payments, documents, loanOffers, loanStatusEnum } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function resetData() {
    console.log("Starting reset...");
    try {
        // 1. DELETE LOANS & RELATED
        await db.delete(payments);
        await db.delete(documents);
        await db.delete(loanOffers);
        await db.delete(loans);
        console.log("Data cleared (Loans, Payments, Documents).");

        // 2. PREPARE USERS
        const plainPassword = "123456";
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const targetUsers = [
            { email: 'test@gmail.com', name: 'Usuario Prueba' },
            { email: 'henry@gmail.com', name: 'Henry Chavez' }
        ];

        for (const u of targetUsers) {
            const existing = await db.select().from(users).where(eq(users.email, u.email));

            if (existing.length > 0) {
                // Update password
                await db.update(users)
                    .set({ passwordHash: hashedPassword })
                    .where(eq(users.email, u.email));
                console.log(`Updated password for ${u.email}`);
            } else {
                // Create user
                await db.insert(users).values({
                    email: u.email,
                    fullName: u.name,
                    passwordHash: hashedPassword,
                    phone: '999999999'
                });
                console.log(`Created user ${u.email}`);
            }
        }

        console.log("\n--- CREDENTIALS ---");
        console.log("Password for all users is: " + plainPassword);
        targetUsers.forEach(u => console.log(`- ${u.email}`));

    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

resetData();
