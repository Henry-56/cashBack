import db from './database';
import { sql } from 'drizzle-orm';

async function fixEnum() {
    try {
        // Check current enum values
        const result = await db.execute(sql`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'loan_status')
        `);
        console.log('Current enum values:', result.rows);

        // Check if AWAITING_CONFIRMATION exists
        const hasAwaitingConfirmation = result.rows.some((r: any) => r.enumlabel === 'AWAITING_CONFIRMATION');

        if (!hasAwaitingConfirmation) {
            console.log('Adding AWAITING_CONFIRMATION to enum...');
            await db.execute(sql`ALTER TYPE loan_status ADD VALUE IF NOT EXISTS 'AWAITING_CONFIRMATION'`);
            console.log('Added successfully!');
        } else {
            console.log('AWAITING_CONFIRMATION already exists');
        }

        // Verify
        const result2 = await db.execute(sql`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'loan_status')
        `);
        console.log('Updated enum values:', result2.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

fixEnum();
