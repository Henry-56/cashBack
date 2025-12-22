import db from '../database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class AuthService {
    async register(data: z.infer<typeof registerSchema>) {
        const validated = registerSchema.parse(data);

        // Check existing
        const existing = await db.select().from(users).where(eq(users.email, validated.email));
        if (existing.length > 0) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        // Create user
        const [newUser] = await db.insert(users).values({
            email: validated.email,
            passwordHash: hashedPassword,
            fullName: validated.fullName,
            phone: validated.phone,
        }).returning();

        // Generate token
        const token = this.generateToken(newUser.id);

        // Remove password from response
        const { passwordHash, ...userWithoutPassword } = newUser;
        return { user: userWithoutPassword, token };
    }

    async login(data: z.infer<typeof loginSchema>) {
        const validated = loginSchema.parse(data);

        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, validated.email));
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const validPassword = await bcrypt.compare(validated.password, user.passwordHash);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(user.id);

        const { passwordHash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }

    private generateToken(userId: string) {
        return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    }
}
