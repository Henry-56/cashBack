import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Loan Offers
    const offers = [
        {
            amount: 100,
            min_term_months: 1,
            max_term_months: 1,
            base_interest_rate: 15.0,
            description: 'Préstamo rápido S/.100',
        },
        {
            amount: 250,
            min_term_months: 1,
            max_term_months: 3,
            base_interest_rate: 12.0,
            description: 'Préstamo personal S/.250',
        },
        {
            amount: 500,
            min_term_months: 1,
            max_term_months: 6,
            base_interest_rate: 10.0,
            description: 'Préstamo plus S/.500',
        },
        {
            amount: 1000,
            min_term_months: 3,
            max_term_months: 12,
            base_interest_rate: 8.0,
            description: 'Préstamo master S/.1000',
        }
    ];

    for (const offer of offers) {
        await prisma.loanOffer.create({
            data: offer
        });
    }

    // Create Test User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            full_name: 'Test User',
            password_hash: hashedPassword,
            phone: '999888777',
            rating: 4.8
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
