import { Request, Response, NextFunction } from 'express';
import db from '../database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    console.log("--- INSIDE isAdmin MIDDLEWARE ---");
    try {
        const userId = req.headers['x-user-id'] || req.body?.userId || req.query?.userId;
        console.log("Extracted userId:", userId);

        if (!userId) {
            console.log("No userId found in request");
            return res.status(401).json({ error: "No se proporcionó ID de usuario" });
        }

        const uuidRegex = /^[0-9a-f-]{36}$/i;
        if (!uuidRegex.test(userId as string)) {
            console.log("Invalid UUID format detected:", userId);
            return res.status(400).json({ error: "Formato de ID de usuario inválido" });
        }

        console.log("Querying database for user role...");
        const result = await db.select().from(users).where(eq(users.id, userId as string));
        console.log("Query result length:", result.length);

        const user = result[0];
        if (!user) {
            console.log("User not found in database:", userId);
            return res.status(403).json({ error: "Acceso denegado: Usuario no encontrado" });
        }

        console.log("User found. Role:", user.role);
        if (user.role !== 'ADMIN') {
            console.log("Unauthorized role:", user.role);
            return res.status(403).json({ error: "Acceso denegado: Se requiere rol de Administrador" });
        }

        console.log("Admin authorized. Proceeding...");
        next();
    } catch (error: any) {
        console.error("FATAL CRASH IN isAdmin MIDDLEWARE:", error);
        res.status(500).json({
            error: "Error en la validación de administrador",
            message: error.message,
            stack: error.stack
        });
    }
};
