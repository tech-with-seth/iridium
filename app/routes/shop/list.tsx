import { data, Link } from 'react-router';

import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Card } from '~/components/Card';
import { Container } from '~/components/Container';
import { Hero } from '~/components/Hero';
import { formatToCurrency } from '~/lib/formatters';
import { polarClient } from '~/lib/polar.server';
import type { ProductPriceFixed } from '@polar-sh/sdk/models/components/productpricefixed.js';
import type { Route } from './+types/list';
import { logException } from '~/lib/posthog';

export async function loader() {
    try {
        const products = await polarClient.products.list({
            organizationId: null,
            isArchived: false,
        });

        return data({ products: products.result.items });
    } catch (error) {
        console.error('Product list error:', error);

        // Track error with PostHog
        logException(error as Error, {
            context: 'shop_loader',
        });

        return data(
            { products: [] },
            {
                status: 500,
                statusText: 'Failed to load products',
            },
        );
    }
}

export default function ShopRoute({ loaderData }: Route.ComponentProps) {
    return (
        <Container className="px-4">
            <Hero className="bg-base-200 min-h-[200px]">
                <div className="text-center">
                    <h1 className="text-5xl font-bold">Shop</h1>
                    <p className="py-6">
                        Browse our collection of premium products
                    </p>
                </div>
            </Hero>

            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
                    {loaderData.products.map((product) => (
                        <Link to={`${product.id}`} key={product.id} className="block">
                            <Card variant="border" className="overflow-hidden group hover:shadow-lg transition">
                                <div className="w-full bg-base-200 aspect-[4/3] flex items-center justify-center overflow-hidden">
                                    {product.medias && product.medias.length > 0 ? (
                                        <img
                                            src={product.medias[0].publicUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="text-center text-base-content/50 select-none p-6">No image</div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                                    <p className="text-sm text-base-content/70 mb-3 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center gap-4">
                                        <Badge color="primary" size="lg">
                                            {formatToCurrency(
                                                'en-US',
                                                'usd',
                                                2,
                                                (product.prices[0] as ProductPriceFixed)
                                                    .priceAmount,
                                            )}
                                        </Badge>

                                        <div className="ml-auto">
                                            <Button status="primary" size="sm">View Details</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Container>
        </Container>
    );
}
