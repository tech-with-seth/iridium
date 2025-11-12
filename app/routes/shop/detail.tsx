import { data, Link } from 'react-router';

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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content"
                        >
                            <span className="text-lg">←</span>
                            <span>Back to Shop</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Image / Media */}
                    <div className="lg:col-span-5">
                        <div className="w-full rounded-xl overflow-hidden bg-base-200 aspect-[4/3] flex items-center justify-center">
                            {loaderData.details.medias &&
                            loaderData.details.medias.length > 0 ? (
                                // show first media's publicUrl if available
                                <img
                                    src={loaderData.details.medias[0].publicUrl}
                                    alt={loaderData.details.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-base-content/50 select-none">
                                    No image available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Details */}
                    <div className="lg:col-span-5">
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                            {loaderData.details.name}
                        </h1>
                        <p className="text-base text-base-content/70 mb-6">
                            {loaderData.details.description}
                        </p>

                        <div className="space-y-4">
                            <Card variant="border" className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-base-content/70">
                                            Type
                                        </h4>
                                        <p className="mt-1 text-sm">
                                            {loaderData.details.isRecurring
                                                ? 'Subscription'
                                                : 'One-time'}
                                        </p>
                                    </div>

                                    {loaderData.details.isRecurring ? (
                                        <div>
                                            <h4 className="text-sm font-medium text-base-content/70">
                                                Billing
                                            </h4>
                                            <p className="mt-1 text-sm capitalize">
                                                Every{' '}
                                                {
                                                    loaderData.details
                                                        .recurringInterval
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="text-sm font-medium text-base-content/70">
                                                Status
                                            </h4>
                                            <p className="mt-1 text-sm">
                                                <Badge
                                                    color={
                                                        loaderData.details
                                                            .isArchived
                                                            ? 'warning'
                                                            : 'success'
                                                    }
                                                >
                                                    {loaderData.details
                                                        .isArchived
                                                        ? 'Archived'
                                                        : 'Active'}
                                                </Badge>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card variant="border" className="p-6">
                                <h3 className="text-sm font-medium text-base-content/70">
                                    Details
                                </h3>
                                <div className="mt-3 prose text-sm text-base-content/70">
                                    {/* Keep simple: description already shown above; other metadata could go here */}
                                    <p className="mb-0">
                                        SKU:{' '}
                                        <span className="font-mono text-xs break-all">
                                            {loaderData.details.id}
                                        </span>
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Purchase / CTA */}
                    <aside className="lg:col-span-2">
                        <div className="sticky top-6">
                            <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-lg">
                                <div className="mb-3">
                                    <p className="text-sm text-base-content/60">
                                        Price
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold">
                                            {formatToCurrency(
                                                'en-US',
                                                'usd',
                                                2,
                                                price.priceAmount,
                                            )}
                                        </span>
                                        {loaderData.details.isRecurring && (
                                            <span className="text-sm text-base-content/60">
                                                /{' '}
                                                {
                                                    loaderData.details
                                                        .recurringInterval
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    to={`/shop/checkout?products=${encodeURIComponent(loaderData.details!.id)}`}
                                    className="inline-block w-full text-center bg-primary text-white py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition"
                                >
                                    Purchase Now
                                </Link>

                                <div className="mt-4 text-xs text-base-content/50 text-center">
                                    <div>Free returns · 30-day warranty</div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </Container>
    );
}
