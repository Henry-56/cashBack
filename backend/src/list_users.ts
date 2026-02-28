import db from './database';
import { users } from './db/schema';

async function listUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log('--- USUARIOS REGISTRADOS ---');
        allUsers.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | Nombre: ${u.fullName} | DNI: ${u.documentNumber}`);
        });
        console.log('----------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        process.exit(1);
    }
}

listUsers();
