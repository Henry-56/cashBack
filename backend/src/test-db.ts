import { Client } from 'pg';

const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_n1mlbW3zewHc@ep-shiny-tooth-a41uen9s-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

client.connect()
    .then(() => {
        console.log('Connected successfully to Neon DB!');
        return client.end();
    })
    .catch((err) => {
        console.error('Connection error:', err);
        process.exit(1);
    });
