import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_n1mlbW3zewHc@ep-shiny-tooth-a41uen9s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const run = async () => {
    try {
        await client.connect();
        console.log("Connected to DB");
        await client.query(`ALTER TABLE loans ADD COLUMN IF NOT EXISTS lender_id UUID REFERENCES users(id);`);
        console.log("Column lender_id added successfully");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
};

run();
