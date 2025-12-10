'use strict';

import 'dotenv/config';
import { polarClient } from '~/lib/polar';

async function main() {
    try {
        console.log('Fetching customers...');

        const result = await polarClient.customers.list({
            organizationId: process.env['POLAR_ORGANIZATION_ID'],
        });

        for await (const page of result) {
            const customers = page.result.items;
            console.log(`Found ${customers.length} customers in this page`);

            for (const customer of customers) {
                console.log(`Customer: ${customer.id} (${customer.email})`);
            }
        }

        console.log('\n✅ Successfully fetched all customers');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
