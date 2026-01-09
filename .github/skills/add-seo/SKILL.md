---
name: add-seo
description: Add SEO meta tags, Open Graph tags, and structured data to routes. Use when optimizing pages for search engines or social sharing.
---

# Add SEO

Adds SEO optimization including meta tags, Open Graph, Twitter cards, and structured data using React 19 patterns.

## When to Use

- Adding page titles and descriptions
- Setting up Open Graph for social sharing
- Adding Twitter card metadata
- Implementing structured data (JSON-LD)
- User asks to "add SEO", "add meta tags", or "optimize for search"

## React 19 Meta Pattern

**Use native JSX tags, NOT `meta()` export.**

```tsx
import type { Route } from './+types/product';

export default function ProductPage({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;

    return (
        <>
            {/* Required */}
            <title>{product.name} | Iridium</title>
            <meta name="description" content={product.description} />

            {/* Open Graph */}
            <meta property="og:title" content={product.name} />
            <meta property="og:description" content={product.description} />
            <meta property="og:image" content={product.imageUrl} />
            <meta property="og:type" content="product" />
            <meta property="og:url" content={`https://example.com/products/${product.id}`} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={product.name} />
            <meta name="twitter:description" content={product.description} />
            <meta name="twitter:image" content={product.imageUrl} />

            {/* Page content */}
            <Container>
                <h1>{product.name}</h1>
            </Container>
        </>
    );
}
```

## Basic Page SEO

```tsx
export default function AboutPage() {
    return (
        <>
            <title>About Us | Iridium</title>
            <meta name="description" content="Learn about our mission, team, and values." />
            <meta name="robots" content="index, follow" />

            <Container>
                {/* Page content */}
            </Container>
        </>
    );
}
```

## Dynamic SEO from Loader Data

```tsx
import type { Route } from './+types/blog-post';

export async function loader({ params }: Route.LoaderArgs) {
    const post = await getPost(params.slug);
    return { post };
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
    const { post } = loaderData;
    const canonicalUrl = `https://example.com/blog/${post.slug}`;

    return (
        <>
            <title>{post.title} | Blog | Iridium</title>
            <meta name="description" content={post.excerpt} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Article-specific Open Graph */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.excerpt} />
            <meta property="og:image" content={post.featuredImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="article:published_time" content={post.publishedAt} />
            <meta property="article:author" content={post.author.name} />

            <Container>
                <article>
                    <h1>{post.title}</h1>
                    {/* Post content */}
                </article>
            </Container>
        </>
    );
}
```

## Structured Data (JSON-LD)

```tsx
import type { Route } from './+types/product';

export default function ProductPage({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <>
            <title>{product.name} | Iridium</title>
            <meta name="description" content={product.description} />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />

            <Container>
                {/* Product content */}
            </Container>
        </>
    );
}
```

## Organization Structured Data

```tsx
const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Iridium',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
        'https://twitter.com/iridium',
        'https://github.com/iridium',
    ],
};
```

## Breadcrumb Structured Data

```tsx
const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://example.com',
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: 'https://example.com/products',
        },
        {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `https://example.com/products/${product.id}`,
        },
    ],
};
```

## No-Index Pages

For pages that shouldn't appear in search:

```tsx
export default function PrivatePage() {
    return (
        <>
            <title>Private Page | Iridium</title>
            <meta name="robots" content="noindex, nofollow" />
            {/* Content */}
        </>
    );
}
```

## SEO Checklist

- [ ] Unique `<title>` for each page (50-60 chars)
- [ ] `<meta name="description">` (150-160 chars)
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags
- [ ] Canonical URL for duplicate content
- [ ] Structured data where appropriate
- [ ] No-index on private pages

## Anti-Patterns

- Using `meta()` export (old pattern)
- Duplicate titles across pages
- Missing descriptions
- Descriptions over 160 characters
- Missing Open Graph image
- Using same meta on all pages

## Full Reference

See `.github/instructions/seo.instructions.md` for comprehensive documentation.
