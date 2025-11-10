import { data, Link, useNavigate } from 'react-router';

import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import { formatToCurrency } from '~/lib/formatters';
import { polarClient } from '~/lib/polar.server';
import type { ProductPriceFixed } from '@polar-sh/sdk/models/components/productpricefixed.js';
import type { Route } from './+types/detail';
import { logException } from '~/lib/posthog';

export async function loader({ params }: Route.LoaderArgs) {
    try {
        const details = await polarClient.products.get({
            id: params.productId!,
        });

        return data({
            details,
        });
    } catch (error: unknown) {
        console.error('Product list error:', error);

        // Track error with PostHog
        logException(error as Error, {
            context: 'shop_details_loader',
        });

        return data(
            { details: null },
            {
                status: 500,
                statusText: 'Failed to load product details',
            },
        );
    }
}

export default function ShopDetailsRoute({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();

    if (!loaderData.details) {
        return (
            <Container>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold">Product not found</h2>
                    <Link to="/shop">
                        <Button status="primary" className="mt-4">
                            Back to Shop
                        </Button>
                    </Link>
                </div>
            </Container>
        );
    }

    const price = loaderData.details.prices[0] as ProductPriceFixed;

    return (
        <Container className="px-4">
            <div className="py-12">
                {/* Back Button */}
                <Link to="/shop">
                    <Button variant="ghost" size="sm" className="mb-6">
                        ← Back to Shop
                    </Button>
                </Link>

                {/* Product Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-3">
                        {loaderData.details.name}
                    </h1>
                    <p className="text-xl text-base-content/70">
                        {loaderData.details.description}
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="border">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Product Type
                                    </h3>
                                    <p className="text-base-content/70">
                                        {loaderData.details.isRecurring
                                            ? 'Subscription'
                                            : 'One-time Purchase'}
                                    </p>
                                </div>

                                {loaderData.details.isRecurring && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Billing Cycle
                                        </h3>
                                        <p className="text-base-content/70 capitalize">
                                            Billed{' '}
                                            {
                                                loaderData.details
                                                    .recurringInterval
                                            }
                                            ly
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Status
                                    </h3>
                                    <Badge
                                        color={
                                            loaderData.details.isArchived
                                                ? 'warning'
                                                : 'success'
                                        }
                                        size="lg"
                                    >
                                        {loaderData.details.isArchived
                                            ? 'Archived'
                                            : 'Active'}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Purchase Card */}
                    <div className="lg:col-span-1">
                        <Card variant="border" className="sticky top-4">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-base-content/60 mb-2">
                                        Price
                                    </p>
                                    <div className="text-4xl font-bold mb-1">
                                        {formatToCurrency(
                                            'en-US',
                                            'usd',
                                            2,
                                            price.priceAmount,
                                        )}
                                    </div>
                                    {loaderData.details.isRecurring && (
                                        <p className="text-sm text-base-content/60">
                                            per{' '}
                                            {
                                                loaderData.details
                                                    .recurringInterval
                                            }
                                        </p>
                                    )}
                                </div>
                                <Link
                                    to={`/shop/checkout?products=${encodeURIComponent(loaderData.details!.id)}`}
                                >
                                    Purchase Now
                                </Link>
                                <div className="pt-4 border-t border-base-300">
                                    <p className="text-xs text-base-content/50 font-mono break-all">
                                        ID: {loaderData.details.id}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Container>
    );
}
