import db from '../database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ReniecService } from './reniec.service';

const reniecService = new ReniecService();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
    documentNumber: z.string().min(8).max(12), // Added documentNumber (DNI)
    phone: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export class AuthService {
    async register(data: z.infer<typeof registerSchema>) {
        const validated = registerSchema.parse(data);

        // 1. Validate DNI with RENIEC before registration
        const reniecData = await reniecService.validateDni(validated.documentNumber);

        // Update full name with RENIEC data to ensure authenticity
        const officialFullName = reniecData.full_name;

        // 2. Check existing email
        const existingEmail = await db.select().from(users).where(eq(users.email, validated.email));
        if (existingEmail.length > 0) {
            throw new Error('El correo electrónico ya está registrado. Si ya tienes cuenta, por favor inicia sesión.');
        }

        // 3. Check existing DNI
        const existingDni = await db.select().from(users).where(eq(users.documentNumber, validated.documentNumber));
        if (existingDni.length > 0) {
            throw new Error('El DNI ya se encuentra registrado. Si eres el titular de la cuenta, inicia sesión.');
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(validated.password, 10);

        // 5. Create user
        const [newUser] = await db.insert(users).values({
            email: validated.email,
            passwordHash: hashedPassword,
            fullName: officialFullName,
            documentNumber: validated.documentNumber,
            phone: validated.phone,
            rating: '1.0', // Explicitly start with 1 star as requested
        }).returning();

        // 6. Generate token
        const token = this.generateToken(newUser.id);

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
