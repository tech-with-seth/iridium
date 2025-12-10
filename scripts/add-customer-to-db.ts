'use strict';

import 'dotenv/config';

import inquirer from 'inquirer';

import { Role } from '~/generated/prisma/client';
import { prisma } from '~/db.server';
import { auth } from '~/lib/auth.server';

async function main() {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: "What's the customer's full name?",
                validate(value: string) {
                    if (value.trim().length === 0) {
                        return 'Name is required';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'email',
                message: "What's the customer's email address?",
                validate(value: string) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return 'Please enter a valid email address';
                    }
                    return true;
                },
            },
            {
                type: 'password',
                name: 'password',
                message: "What's the customer's password?",
                mask: '*',
                validate(value: string) {
                    if (value.length < 8) {
                        return 'Password must be at least 8 characters';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'image',
                message: "Customer's profile image URL (optional):",
            },
            {
                type: 'list',
                name: 'role',
                message: "What's the customer's role?",
                choices: [
                    { name: 'User', value: Role.USER },
                    { name: 'Editor', value: Role.EDITOR },
                    { name: 'Admin', value: Role.ADMIN },
                ],
                default: Role.USER,
            },
            {
                type: 'confirm',
                name: 'emailVerified',
                message: 'Should the email be marked as verified?',
                default: false,
            },
        ]);

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: answers.email.toLowerCase() },
        });

        if (existingUser) {
            console.error(
                `❌ User with email ${answers.email} already exists!`,
            );
            process.exit(1);
        }

        // Create the user using BetterAuth
        const result = await auth.api.signUpEmail({
            body: {
                email: answers.email.toLowerCase(),
                password: answers.password,
                name: answers.name,
            },
        });

        if (!result) {
            console.error('❌ Failed to create user with BetterAuth!');
            process.exit(1);
        }

        // Update additional fields that BetterAuth doesn't handle
        const updatedUser = await prisma.user.update({
            where: { email: answers.email.toLowerCase() },
            data: {
                image: answers.image || null,
                role: answers.role,
                emailVerified: answers.emailVerified,
            },
        });

        console.log('\n✅ Customer successfully added to the database!');
        console.log('\nCustomer Details:');
        console.log(`  ID: ${updatedUser.id}`);
        console.log(`  Name: ${updatedUser.name}`);
        console.log(`  Email: ${updatedUser.email}`);
        console.log(`  Role: ${updatedUser.role}`);
        console.log(`  Email Verified: ${updatedUser.emailVerified}`);
        console.log(`  Created At: ${updatedUser.createdAt.toISOString()}`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
