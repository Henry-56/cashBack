import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    console.log('Connecting to database...');
    await client.connect();

    try {
        console.log('Clearing all data...');
        // Using CASCADE to handle foreign key constraints automatically
        await client.query(`
            TRUNCATE TABLE 
                documents,
                payments,
                loan_offers,
                loans,
                users
            RESTART IDENTITY CASCADE;
        `);
        console.log('Database cleared successfully!');
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
