import type { Config } from '@react-router/dev/config';
import { Polar } from '@polar-sh/sdk';
import 'dotenv/config';

import { Paths } from './app/constants';

// TODO: Figure out why I can't use polarClient from polar.server.ts here
const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: 'sandbox',
});

export default {
    future: {
        v8_middleware: true,
    },
    async prerender() {
        try {
            // Fetch all non-archived products
            const products = await polarClient.products.list({
                organizationId: process.env.POLAR_ORGANIZATION_ID || null,
                isArchived: false,
            });

            // Generate paths for each product
            const productPaths = products.result.items.map(
                (product) => `${Paths.SHOP}/${product.id}`,
            );

            // Return static paths + product paths
            return [
                Paths.HOME,
                Paths.SIGN_IN,
                Paths.SHOP,
                Paths.DESIGN,
                ...productPaths,
            ];
        } catch (error) {
            console.error('Failed to fetch products for pre-rendering:', error);
            // Return basic paths if product fetch fails
            return [Paths.HOME, Paths.SIGN_IN, Paths.SHOP];
        }
    },
    ssr: true,
} satisfies Config;
