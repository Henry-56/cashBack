import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './db/schema';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_n1mlbW3zewHc@ep-shiny-tooth-a41uen9s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

client.connect().catch((err) => {
    console.error("DB Connection Error:", err);
});

const db = drizzle(client, { schema });

export default db;
