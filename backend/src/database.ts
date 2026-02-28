import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './db/schema';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
    console.error("DB Connection Error:", err);
});

const db = drizzle(client, { schema });

export default db;
