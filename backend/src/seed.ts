
import db from './database';
import { loanOffers, users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function seed() {
    console.log('Seeding database with Drizzle...');

    try {
        // 1. Create Loan Offers
        const offers = [
            {
                amount: '100.00',
                minTermMonths: 1,
                maxTermMonths: 1,
                baseInterestRate: '15.00',
                description: 'Préstamo rápido S/.100',
            },
            {
                amount: '250.00',
                minTermMonths: 1,
                maxTermMonths: 3,
                baseInterestRate: '12.00',
                description: 'Préstamo personal S/.250',
            },
            {
                amount: '500.00',
                minTermMonths: 1,
                maxTermMonths: 6,
                baseInterestRate: '10.00',
                description: 'Préstamo plus S/.500',
            },
            {
                amount: '1000.00',
                minTermMonths: 3,
                maxTermMonths: 12,
                baseInterestRate: '8.00',
                description: 'Préstamo master S/.1000',
            }
        ];

        console.log('Creating loan offers...');
        for (const offer of offers) {
            // Check if exists to avoid duplicates if re-run without clean
            // Since we don't have a unique key on amount/desc, we might just insert or skip.
            // Let's just insert for now, assuming clean DB or idempotent check.
            // Actually, let's clear offers first as per reset_data approach or just append?
            // reset_data clears everything. Let's make this script standalone safe.

            await db.insert(loanOffers).values(offer);
        }
        console.log('Loan offers created.');

        // 2. Create Test User
        const email = 'test@example.com';
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length === 0) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await db.insert(users).values({
                email,
                fullName: 'Test User',
                passwordHash: hashedPassword,
                phone: '999888777',
                rating: '4.8'
            });
            console.log('Test user created.');
        } else {
            console.log('Test user already exists.');
        }

        console.log('Seeding finished successfully.');
    } catch (error) {
        console.error('Seeding error:', error);
    }
    process.exit(0);
}

seed();
