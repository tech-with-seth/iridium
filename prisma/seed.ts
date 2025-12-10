import 'dotenv/config';
import { PrismaClient, Role } from '../app/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { auth } from '../app/lib/auth.server.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

/**
 * Test user configuration with credentials and role.
 */
interface TestUser {
    email: string;
    password: string;
    name: string;
    role: Role;
}

/**
 * Test data configuration - centralized definition of all seed data.
 * Modify this object to change test data without touching implementation logic.
 */
const SEED_DATA = {
    users: [
        {
            email: 'admin@iridium.com',
            password: 'Admin123!',
            name: 'Admin User',
            role: Role.ADMIN,
        },
        {
            email: 'editor@iridium.com',
            password: 'Editor123!',
            name: 'Editor User',
            role: Role.EDITOR,
        },
        {
            email: 'alice@iridium.com',
            password: 'Alice123!',
            name: 'Alice Johnson',
            role: Role.USER,
        },
        {
            email: 'bob@iridium.com',
            password: 'BobBob123!',
            name: 'Bob Smith',
            role: Role.USER,
        },
        {
            email: 'charlie@iridium.com',
            password: 'Charlie123!',
            name: 'Charlie Davis',
            role: Role.USER,
        },
    ] satisfies TestUser[],
} as const;

/**
 * Creates a user with BetterAuth authentication.
 * Uses BetterAuth's signUpEmail API which handles password hashing and account creation.
 *
 * @param email - User email address (must be unique)
 * @param password - Plain text password (will be hashed by BetterAuth)
 * @param name - User display name
 * @param role - User role (USER, EDITOR, or ADMIN)
 * @returns Created user record from database
 * @throws Error if user creation fails
 */
async function createUserWithAuth(
    email: string,
    password: string,
    name: string,
    role: Role,
) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        console.log(`   ✓ User ${email} already exists`);
        return existingUser;
    }

    // BetterAuth handles password hashing and creates the user account
    const result = await auth.api.signUpEmail({
        body: { email, password, name },
    });

    if (!result?.user) {
        throw new Error(`Failed to create user ${email}`);
    }

    // Update role (BetterAuth defaults to USER role)
    const updatedUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
            role,
            emailVerified: true, // Skip verification for seed data
        },
    });

    console.log(`   ✓ Created user ${email} with role ${role}`);
    return updatedUser;
}

/**
 * Seeds all users defined in SEED_DATA configuration.
 */
async function seedUsers() {
    console.log('\n👤 Creating users...');

    for (const userData of SEED_DATA.users) {
        await createUserWithAuth(
            userData.email,
            userData.password,
            userData.name,
            userData.role,
        );
    }
}

/**
 * Main seed function that orchestrates all database seeding operations.
 * Seeds test users with various roles.
 */
export async function main() {
    console.log('🌱 Start seeding...');

    await seedUsers();

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(
        `   • Users: ${SEED_DATA.users.length} (1 admin, 1 editor, 3 regular users)`,
    );
    console.log('\n🔑 Login Credentials:');

    for (const user of SEED_DATA.users) {
        console.log(`   • ${user.email} / ${user.password}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
