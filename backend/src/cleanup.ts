
import db from './database';
import { users, loans, payments, documents, loanOffers } from './db/schema';
import { eq } from 'drizzle-orm';

async function cleanup() {
    console.log("Cleaning up loans...");
    try {
        await db.delete(payments);
        await db.delete(documents);
        await db.delete(loanOffers);
        await db.delete(loans);
        console.log("All loans, payments, and documents deleted.");

        const allUsers = await db.select().from(users);
        console.log("\n--- USERS ---");
        allUsers.forEach(u => {
            console.log(`Email: ${u.email}, Name: ${u.fullName}, ID: ${u.id}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

cleanup();
