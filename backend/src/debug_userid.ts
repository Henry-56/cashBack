
import db from './database';
import { loans } from './db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        const result = await db.select().from(loans).where(eq(loans.status, 'PENDING')).limit(1);
        if (result.length > 0) {
            const fs = require('fs');
            fs.writeFileSync('userid.txt', result[0].userId);
            console.log("Written to userid.txt");
        } else {
            console.log("NO_LOANS");
        }
        process.exit(0);
    } catch (error) {
        console.error("ERROR:", error);
        process.exit(1);
    }
}

main();
