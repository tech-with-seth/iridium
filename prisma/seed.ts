import { PrismaClient } from '../app/generated/prisma/client.js';
import { auth } from '../app/lib/auth.server.js';

const prisma = new PrismaClient();

const userData = [
    {
        name: 'Seth Davis',
        email: 'seth@mail.com',
        password: 'asdfasdf',
    },
];

export async function main() {
    console.log('Start seeding...');

    for (const userInfo of userData) {
        try {
            // Use BetterAuth to create users with proper password hashing
            const result = await auth.api.signUpEmail({
                body: {
                    email: userInfo.email,
                    password: userInfo.password,
                    name: userInfo.name,
                },
            });

            // Update additional fields that aren't handled in signup
            if (result.user?.id) {
                await prisma.user.update({
                    where: { id: result.user.id },
                    data: {
                        emailVerified: true,
                    },
                });
            }

            console.log(
                `Created user: ${userInfo.email} with id: ${result.user?.id}`,
            );
        } catch (error) {
            console.error(`Failed to create user ${userInfo.email}:`, error);
        }
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
