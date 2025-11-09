'use strict';

import { polarClient } from '~/lib/polar.server';
import 'dotenv/config';

async function main() {
    try {
        console.log('Fetching products...');

        const result = await polarClient.products.list({
            organizationId: process.env['POLAR_ORGANIZATION_ID'],
        });

        let totalArchived = 0;

        for await (const page of result) {
            const products = page.result.items;
            console.log(`Found ${products.length} products in this page`);

            for (const product of products) {
                console.log(
                    `Archiving product: ${product.id} (${product.name})`,
                );

                await polarClient.products.update({
                    id: product.id,
                    productUpdate: {
                        isArchived: true,
                    },
                });

                totalArchived++;
                console.log(`✓ Archived product: ${product.id}`);
            }
        }

        console.log(`\n✅ Successfully archived ${totalArchived} products`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
