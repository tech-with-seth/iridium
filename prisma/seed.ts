import { PrismaClient, Prisma } from '../app/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

import { auth } from '../app/lib/auth.server.js';
import { Role, OrganizationRole } from '../app/generated/prisma/client.js';

import 'dotenv/config';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function createUserWithAuth(
    email: string,
    password: string,
    name: string,
    role: Role = Role.USER,
    additionalData?: {
        bio?: string;
        website?: string;
        location?: string;
        phoneNumber?: string;
    },
) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`   ✓ User ${email} already exists`);
        return existingUser;
    }

    // Create user with BetterAuth (handles password hashing and account creation)
    const result = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
        },
    });

    if (!result || !result.user) {
        throw new Error(`Failed to create user ${email}`);
    }

    // Update user with additional data and role
    const updatedUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
            role,
            emailVerified: true, // Mark as verified for seed data
            ...additionalData,
        },
    });

    console.log(`   ✓ Created user ${email} with role ${role}`);
    return updatedUser;
}

export async function main() {
    console.log('🌱 Start seeding...');

    // Create Admin User
    console.log('\n👤 Creating admin user...');
    const adminUser = await createUserWithAuth(
        'admin@iridium.com',
        'Admin123!',
        'Admin User',
        Role.ADMIN,
        {
            bio: 'Platform administrator',
            location: 'San Francisco, CA',
            website: 'https://iridium.com',
        },
    );

    // Create Editor User
    console.log('\n👤 Creating editor user...');
    const editorUser = await createUserWithAuth(
        'editor@iridium.com',
        'Editor123!',
        'Editor User',
        Role.EDITOR,
        {
            bio: 'Content editor and moderator',
            location: 'New York, NY',
        },
    );

    // Create Regular Users
    console.log('\n👤 Creating regular users...');
    const user1 = await createUserWithAuth(
        'alice@iridium.com',
        'Alice123!',
        'Alice Johnson',
        Role.USER,
        {
            bio: 'Software engineer passionate about web development',
            location: 'Austin, TX',
            website: 'https://alice.dev',
            phoneNumber: '+1-555-0101',
        },
    );

    const user2 = await createUserWithAuth(
        'bob@iridium.com',
        'BobBob123!',
        'Bob Smith',
        Role.USER,
        {
            bio: 'Product designer and UX enthusiast',
            location: 'Seattle, WA',
            phoneNumber: '+1-555-0102',
        },
    );

    const user3 = await createUserWithAuth(
        'charlie@iridium.com',
        'Charlie123!',
        'Charlie Davis',
        Role.USER,
        {
            bio: 'Data scientist and ML researcher',
            location: 'Boston, MA',
            website: 'https://charlied.ai',
        },
    );

    // Create Organizations
    console.log('\n🏢 Creating organizations...');

    const org1 = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corporation',
            slug: 'acme-corp',
            ownerId: adminUser.id,
        },
    });
    console.log('   ✓ Created organization: Acme Corporation');

    const org2 = await prisma.organization.upsert({
        where: { slug: 'tech-innovations' },
        update: {},
        create: {
            name: 'Tech Innovations',
            slug: 'tech-innovations',
            ownerId: user1.id,
        },
    });
    console.log('   ✓ Created organization: Tech Innovations');

    const org3 = await prisma.organization.upsert({
        where: { slug: 'creative-studio' },
        update: {},
        create: {
            name: 'Creative Studio',
            slug: 'creative-studio',
            ownerId: user2.id,
        },
    });
    console.log('   ✓ Created organization: Creative Studio');

    // Create Organization Members
    console.log('\n👥 Creating organization members...');

    // Acme Corp members
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org1.id,
                userId: adminUser.id,
            },
        },
        update: {},
        create: {
            organizationId: org1.id,
            userId: adminUser.id,
            role: OrganizationRole.OWNER,
        },
    });

    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org1.id,
                userId: editorUser.id,
            },
        },
        update: {},
        create: {
            organizationId: org1.id,
            userId: editorUser.id,
            role: OrganizationRole.ADMIN,
        },
    });

    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org1.id,
                userId: user1.id,
            },
        },
        update: {},
        create: {
            organizationId: org1.id,
            userId: user1.id,
            role: OrganizationRole.MEMBER,
        },
    });

    console.log('   ✓ Added members to Acme Corporation');

    // Tech Innovations members
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org2.id,
                userId: user1.id,
            },
        },
        update: {},
        create: {
            organizationId: org2.id,
            userId: user1.id,
            role: OrganizationRole.OWNER,
        },
    });

    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org2.id,
                userId: user3.id,
            },
        },
        update: {},
        create: {
            organizationId: org2.id,
            userId: user3.id,
            role: OrganizationRole.ADMIN,
        },
    });

    console.log('   ✓ Added members to Tech Innovations');

    // Creative Studio members
    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org3.id,
                userId: user2.id,
            },
        },
        update: {},
        create: {
            organizationId: org3.id,
            userId: user2.id,
            role: OrganizationRole.OWNER,
        },
    });

    await prisma.organizationMember.upsert({
        where: {
            organizationId_userId: {
                organizationId: org3.id,
                userId: editorUser.id,
            },
        },
        update: {},
        create: {
            organizationId: org3.id,
            userId: editorUser.id,
            role: OrganizationRole.MEMBER,
        },
    });

    console.log('   ✓ Added members to Creative Studio');

    // Create Organization Invitations
    console.log('\n📧 Creating organization invitations...');

    const inviteExpiry = new Date();
    inviteExpiry.setDate(inviteExpiry.getDate() + 7); // Expires in 7 days

    await prisma.organizationInvitation.upsert({
        where: { token: 'invite-token-1' },
        update: {},
        create: {
            organizationId: org1.id,
            email: 'pending1@iridium.com',
            role: OrganizationRole.MEMBER,
            token: 'invite-token-1',
            expiresAt: inviteExpiry,
        },
    });

    await prisma.organizationInvitation.upsert({
        where: { token: 'invite-token-2' },
        update: {},
        create: {
            organizationId: org2.id,
            email: 'pending2@iridium.com',
            role: OrganizationRole.ADMIN,
            token: 'invite-token-2',
            expiresAt: inviteExpiry,
        },
    });

    await prisma.organizationInvitation.upsert({
        where: { token: 'invite-token-3' },
        update: {},
        create: {
            organizationId: org3.id,
            email: 'pending3@iridium.com',
            role: OrganizationRole.MEMBER,
            token: 'invite-token-3',
            expiresAt: inviteExpiry,
        },
    });

    console.log('   ✓ Created 3 pending invitations');

    // Summary
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • Users: 5 (1 admin, 1 editor, 3 regular users)');
    console.log('   • Organizations: 3');
    console.log('   • Organization Members: 6');
    console.log('   • Pending Invitations: 3');
    console.log('\n🔑 Login Credentials:');
    console.log('   • admin@iridium.com / Admin123!');
    console.log('   • editor@iridium.com / Editor123!');
    console.log('   • alice@iridium.com / Alice123!');
    console.log('   • bob@iridium.com / BobBob123!');
    console.log('   • charlie@iridium.com / Charlie123!');
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
