import { polarClient } from '~/lib/polar';

export function getProducts() {
    return polarClient.products.list({
        organizationId: null,
        isArchived: false,
    });
}

export function getCustomerByExternalId(userId: string) {
    return polarClient.customers.list({
        query: userId, // The query parameter searches by external_id
        limit: 1,
    });
}

export async function getProductDetails(id?: string) {
    if (!id || !process.env.POLAR_ACCESS_TOKEN) {
        return null;
    }

    try {
        return await polarClient.products.get({ id });
    } catch {
        return null;
    }
}
