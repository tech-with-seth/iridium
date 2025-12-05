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

export function getProductDetails(id: string) {
    return polarClient.products.get({
        id,
    });
}
