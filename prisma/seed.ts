import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

const seedUsers = [
    { name: 'Alice', email: 'alice@iridium.dev', password: 'password123' },
    { name: 'Bob', email: 'bob@iridium.dev', password: 'password123' },
];

async function main() {
    console.log('Seeding database...');

    for (const user of seedUsers) {
        const existing = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (existing) {
            console.log(`  Skipping ${user.email} (already exists)`);
            continue;
        }

        // Use better-auth API to create users so passwords are hashed
        // and Account records are created correctly
        const response = await fetch(
            `${process.env.BETTER_AUTH_BASE_URL}/api/auth/sign-up/email`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                }),
            },
        );

        if (!response.ok) {
            const body = await response.text();
            console.error(`  Failed to create ${user.email}: ${body}`);
            continue;
        }

        console.log(`  Created ${user.email}`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
