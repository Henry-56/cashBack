import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_n1mlbW3zewHc@ep-shiny-tooth-a41uen9s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function main() {
    await client.connect();
    const db = drizzle(client, { schema });

    console.log('Seeding database...');

    // Create Loan Offers
    const offers = [
        {
            amount: "100.00",
            minTermMonths: 1,
            maxTermMonths: 1,
            baseInterestRate: "15.00",
            description: 'Préstamo rápido S/.100',
        },
        {
            amount: "250.00",
            minTermMonths: 1,
            maxTermMonths: 3,
            baseInterestRate: "12.00",
            description: 'Préstamo personal S/.250',
        },
        {
            amount: "500.00",
            minTermMonths: 1,
            maxTermMonths: 6,
            baseInterestRate: "10.00",
            description: 'Préstamo plus S/.500',
        },
        {
            amount: "1000.00",
            minTermMonths: 3,
            maxTermMonths: 12,
            baseInterestRate: "8.00",
            description: 'Préstamo master S/.1000',
        }
    ];

    await db.insert(schema.loanOffers).values(offers);

    // Create Test User
    const hashedPassword = await bcrypt.hash('password123', 10);
    await db.insert(schema.users).values({
        email: 'test@example.com',
        fullName: 'Test User',
        passwordHash: hashedPassword,
        phone: '999888777',
        rating: "4.8"
    });

    console.log('Seeding finished.');
    await client.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
