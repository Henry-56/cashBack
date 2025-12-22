
import db from './database';
import { users, loans } from './db/schema';

async function listAll() {
    try {
        const allUsers = await db.select().from(users);
        console.log("--- USERS IN DB ---");
        allUsers.forEach(u => {
            console.log(`[${u.id}] ${u.email} (${u.fullName})`);
        });

        const allLoans = await db.select().from(loans);
        console.log("\n--- LOANS IN DB ---");
        allLoans.forEach(l => {
            console.log(`[${l.id}] Amount: ${l.amountRequested}, Status: ${l.status}, User: ${l.userId}`);
        });
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

listAll();
