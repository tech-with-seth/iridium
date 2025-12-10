'use strict';

import 'dotenv/config';
import { polarClient } from '~/lib/polar';
import { prisma } from '~/db.server';

async function main() {
    try {
        console.log('Fetching customers...');

        await prisma.user.deleteMany({}).catch((e) => {
            console.error('Error deleting users from database:', e);
        });

        const result = await polarClient.customers.list({
            organizationId: process.env['POLAR_ORGANIZATION_ID'],
        });

        let totalDeleted = 0;

        for await (const page of result) {
            const customers = page.result.items;
            console.log(`Found ${customers.length} customers in this page`);

            for (const customer of customers) {
                console.log(`Customer: ${customer.id} (${customer.email})`);

                await polarClient.customers.delete({
                    id: customer.id,
                });

                totalDeleted++;
                console.log(`✓ Deleted customer: ${customer.id}`);
            }
        }

        console.log(`\n✅ Successfully deleted ${totalDeleted} customers`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
