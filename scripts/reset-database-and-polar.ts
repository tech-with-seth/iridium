import { polarClient } from '~/lib/polar';
import { spawn } from 'child_process';
import * as readline from 'readline';
import 'dotenv/config';

/**
 * Prompts user for confirmation before executing destructive operations.
 * Requires exact "RESET" input to proceed.
 *
 * @returns True if user confirmed with "RESET", false otherwise
 */
async function promptConfirmation(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(
            '\nType "RESET" to confirm (or anything else to cancel): ',
            (answer) => {
                rl.close();
                resolve(answer.trim() === 'RESET');
            },
        );
    });
}

/**
 * Executes a shell command and returns a promise that resolves when complete.
 * Inherits stdio to display command output in real-time.
 *
 * @param command - Command name (e.g., 'npx', 'npm')
 * @param args - Array of command arguments
 * @param description - Human-readable description for error messages
 * @throws Error if command exits with non-zero code
 */
async function executeCommand(
    command: string,
    args: string[],
    description: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${description} failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(new Error(`${description} error: ${error.message}`));
        });
    });
}

/**
 * Deletes all customers from the configured Polar organization.
 * Iterates through paginated results and deletes each customer individually.
 *
 * @returns Total number of customers deleted
 * @throws Error if POLAR_ORGANIZATION_ID is not configured
 */
async function deletePolarCustomers(): Promise<number> {
    console.log('\n🗑️  Deleting Polar customers...');

    const organizationId = process.env['POLAR_ORGANIZATION_ID'];

    if (!organizationId) {
        console.log('   ⚠️  POLAR_ORGANIZATION_ID not set, skipping Polar cleanup');
        return 0;
    }

    const result = await polarClient.customers.list({ organizationId });
    let totalDeleted = 0;

    for await (const page of result) {
        const customers = page.result.items;

        if (customers.length === 0) {
            console.log('   No customers found');
            continue;
        }

        console.log(`   Found ${customers.length} customers in this page`);

        for (const customer of customers) {
            await polarClient.customers.delete({ id: customer.id });
            totalDeleted++;
            console.log(`   ✓ Deleted customer: ${customer.email}`);
        }
    }

    return totalDeleted;
}

/**
 * Completely resets the database by:
 * 1. Force-pushing schema (drops all data)
 * 2. Regenerating Prisma client
 * 3. Running seed script to populate test data
 *
 * @throws Error if any step fails
 */
async function resetDatabase(): Promise<void> {
    console.log('\n🔄 Resetting database...');

    console.log('   Step 1/3: Pushing schema to database...');
    await executeCommand(
        'npx',
        ['prisma', 'db', 'push', '--force-reset', '--accept-data-loss'],
        'Prisma db push',
    );

    console.log('   Step 2/3: Generating Prisma client...');
    await executeCommand('npx', ['prisma', 'generate'], 'Prisma generate');

    console.log('   Step 3/3: Seeding database...');
    await executeCommand('npm', ['run', 'seed'], 'Database seed');
}

/**
 * Main execution function that orchestrates the complete reset process.
 * Prompts for confirmation, then deletes Polar customers and resets database.
 */
async function main() {
    try {
        console.log('⚠️  WARNING: This script will completely reset your database and delete all Polar customers!');
        console.log('\n📋 What will happen:');
        console.log('   1. Delete all Polar customers from your organization');
        console.log('   2. Drop and recreate your database (prisma db push --force-reset)');
        console.log('   3. Generate Prisma client');
        console.log('   4. Seed the database with test users');
        console.log('\n🔒 What will NOT be affected:');
        console.log('   • Polar products (will remain unchanged)');

        const confirmed = await promptConfirmation();

        if (!confirmed) {
            console.log('\n❌ Reset cancelled');
            process.exit(0);
        }

        console.log('\n🚀 Starting reset process...');

        const deletedCustomers = await deletePolarCustomers();
        await resetDatabase();

        console.log('\n✅ Reset completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   • Polar customers deleted: ${deletedCustomers}`);
        console.log('   • Database reset: Complete');
        console.log('   • Database seeded: Complete');
        console.log('\n🔑 Test Login Credentials:');
        console.log('   • admin@iridium.com / Admin123!');
        console.log('   • editor@iridium.com / Editor123!');
        console.log('   • alice@iridium.com / Alice123!');
        console.log('   • bob@iridium.com / BobBob123!');
        console.log('   • charlie@iridium.com / Charlie123!');
    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
