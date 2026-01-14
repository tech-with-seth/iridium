---
applyTo: 'app/routes/**/*.tsx'
---

# SEO & Meta Tags

## Overview

**This project uses React 19's native `<title>` and `<meta>` elements for SEO.** These elements can be rendered directly in component JSX and React automatically places them in the document `<head>`, regardless of where in the component tree they're rendered.

### Why This Pattern?

- ✅ **React 19 native** - Built-in meta tag hoisting to document head
- ✅ **Component-scoped** - Meta tags defined where they're used
- ✅ **No special exports** - No legacy `meta()` export function needed
- ✅ **Type-safe** - Standard JSX with TypeScript support
- ✅ **Dynamic values** - Use props, loaderData, or state in meta content
- ✅ **SEO-friendly** - Works with SSR and pre-rendering

## ⚠️ CRITICAL: React 19 Pattern Only

**DO NOT use the legacy `meta()` export function.** React Router v7 supports it for backwards compatibility, but this project uses React 19's built-in `<meta>` elements exclusively.

```tsx
// ✅ CORRECT - React 19 pattern (USE THIS)
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta name="description" content="Page description" />
            <Container>
                {/* Page content */}
            </Container>
        </>
    );
}

// ❌ WRONG - Legacy pattern (DO NOT USE)
export function meta() {
    return [
        { title: "Page Title" },
        { name: "description", content: "Page description" }
    ];
}
```

## Standard Implementation

### Basic Page Meta Tags

Every route should include at minimum:
1. **`<title>`** - Page title (required)
2. **`<meta name="description">`** - Page description (highly recommended)

```tsx
import { Container } from '~/components/Container';

export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta
                name="description"
                content="A clear, concise description of this page's content for search engines and social sharing."
            />
            <Container>
                <h1>Page Title</h1>
                {/* Page content */}
            </Container>
        </>
    );
}
```

### Title Format

**Standard pattern:** `[Page Name] - Iridium`

```tsx
// ✅ Good title formats
<title>Dashboard - Iridium</title>
<title>Sign In - Iridium</title>
<title>Payment Successful - Iridium</title>

// ✅ Homepage can be just brand name
<title>Iridium</title>

// ❌ Avoid too long (>60 characters gets truncated in search results)
<title>This Is An Extremely Long Page Title That Will Get Truncated In Search Engine Results - Iridium</title>
```

### Description Guidelines

**Best Practices:**
- **Length:** 150-160 characters (optimal for search results)
- **Content:** Clear summary of page purpose and value
- **Keywords:** Include relevant keywords naturally
- **Unique:** Each page should have a unique description
- **Compelling:** Write for users, not just search engines

```tsx
// ✅ Good descriptions
<meta
    name="description"
    content="Modern full-stack boilerplate with authentication, billing, and AI"
/>

<meta
    name="description"
    content="Overview of your Iridium account and activity."
/>

// ❌ Too short (not descriptive enough)
<meta name="description" content="Dashboard page" />

// ❌ Too long (>160 chars gets truncated)
<meta
    name="description"
    content="This is an extremely long description that goes into way too much detail about every single feature and capability of this particular page which will definitely get truncated in search results and won't be fully visible to users browsing Google or other search engines."
/>
```

## Dynamic Meta Tags

### Using Loader Data

Meta tags can dynamically render based on data from loaders:

```tsx
import type { Route } from './+types/product';
import { Container } from '~/components/Container';

export async function loader({ params }: Route.LoaderArgs) {
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    });

    if (!product) {
        throw data('Product Not Found', { status: 404 });
    }

    return { product };
}

export default function Product({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;

    return (
        <>
            <title>{product.name} - Iridium</title>
            <meta
                name="description"
                content={`${product.name}: ${product.description.slice(0, 155)}`}
            />
            <Container>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
            </Container>
        </>
    );
}
```

### Using Conditional Logic

```tsx
import { Container } from '~/components/Container';

export default function AuthPage() {
    const isSignIn = useIsSignIn(); // Your hook

    return (
        <>
            <title>{`${isSignIn ? 'Sign In' : 'Sign Up'} - Iridium`}</title>
            <meta
                name="description"
                content={
                    isSignIn
                        ? 'Sign in to your Iridium account'
                        : 'Create a new Iridium account'
                }
            />
            <Container>
                {/* Auth form */}
            </Container>
        </>
    );
}
```

## Open Graph & Social Media Tags

Open Graph tags control how your pages appear when shared on social media platforms (Facebook, LinkedIn, etc.).

### Basic Open Graph Tags

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta name="description" content="Page description" />

            {/* Open Graph tags */}
            <meta property="og:title" content="Page Title" />
            <meta
                property="og:description"
                content="Page description for social sharing"
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://yoursite.com/page" />
            <meta
                property="og:image"
                content="https://yoursite.com/og-image.jpg"
            />

            <Container>{/* Page content */}</Container>
        </>
    );
}
```

### Open Graph Image Guidelines

- **Size:** 1200x630px (1.91:1 ratio) is the standard
- **Format:** JPG or PNG
- **File size:** Under 8MB (preferably under 1MB)
- **Content:** Include text overlay, branding, and visual hierarchy
- **Fallback:** Always have a default OG image for pages without specific images

```tsx
// With dynamic image from loader data
export default function Product({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;

    return (
        <>
            <title>{product.name} - Iridium</title>
            <meta name="description" content={product.description} />

            <meta property="og:title" content={product.name} />
            <meta property="og:description" content={product.description} />
            <meta property="og:type" content="product" />
            <meta
                property="og:image"
                content={product.imageUrl || '/default-og-image.jpg'}
            />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={product.name} />

            <Container>{/* Product content */}</Container>
        </>
    );
}
```

## Twitter Card Tags

Twitter Cards control how your pages appear on Twitter/X. Twitter also uses Open Graph tags as fallbacks.

### Summary Card (Default)

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:site" content="@yourtwitterhandle" />
            <meta name="twitter:title" content="Page Title" />
            <meta name="twitter:description" content="Page description" />
            <meta name="twitter:image" content="https://yoursite.com/image.jpg" />
            <meta name="twitter:image:alt" content="Image description" />

            <Container>{/* Page content */}</Container>
        </>
    );
}
```

### Large Image Card

For pages with prominent images (blog posts, products):

```tsx
export default function BlogPost({ loaderData }: Route.ComponentProps) {
    const { post } = loaderData;

    return (
        <>
            <title>{post.title} - Iridium Blog</title>
            <meta name="description" content={post.excerpt} />

            {/* Twitter large image card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@yourtwitterhandle" />
            <meta name="twitter:title" content={post.title} />
            <meta name="twitter:description" content={post.excerpt} />
            <meta name="twitter:image" content={post.coverImage} />
            <meta name="twitter:image:alt" content={post.coverImageAlt} />

            {/* Open Graph tags (Twitter uses as fallback) */}
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.excerpt} />
            <meta property="og:type" content="article" />
            <meta property="og:image" content={post.coverImage} />
            <meta property="og:article:published_time" content={post.publishedAt} />
            <meta property="og:article:author" content={post.author.name} />

            <Container>{/* Blog post content */}</Container>
        </>
    );
}
```

### Twitter Card Types

- **`summary`** - Small image, title, description (default)
- **`summary_large_image`** - Large image preview (1.91:1 ratio)
- **`app`** - Mobile app download promotion
- **`player`** - Video/audio player embed

## Additional Meta Tags

### Viewport (Should be in root.tsx only)

```tsx
// app/root.tsx
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Charset (Should be in root.tsx only)

```tsx
// app/root.tsx
<meta charSet="utf-8" />
```

### Robots Meta Tag

Control search engine indexing:

```tsx
// Allow indexing (default)
<meta name="robots" content="index, follow" />

// Prevent indexing (for admin/private pages)
<meta name="robots" content="noindex, nofollow" />

// Prevent indexing but allow link following
<meta name="robots" content="noindex, follow" />
```

**Example use cases:**

```tsx
// Admin dashboard - don't index
export default function AdminDashboard() {
    return (
        <>
            <title>Admin Dashboard - Iridium</title>
            <meta name="robots" content="noindex, nofollow" />
            <Container>{/* Admin content */}</Container>
        </>
    );
}

// Staging/preview environment
export default function PreviewPage() {
    const isProduction = process.env.NODE_ENV === 'production';

    return (
        <>
            <title>Preview Page - Iridium</title>
            {!isProduction && <meta name="robots" content="noindex, nofollow" />}
            <Container>{/* Page content */}</Container>
        </>
    );
}
```

### Canonical URL

Specify the preferred URL when duplicate content exists:

```tsx
export default function Product({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;
    const canonicalUrl = `https://yoursite.com/products/${product.slug}`;

    return (
        <>
            <title>{product.name} - Iridium</title>
            <link rel="canonical" href={canonicalUrl} />
            <Container>{/* Product content */}</Container>
        </>
    );
}
```

### Language & Locale

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="es_ES" />
            <Container>{/* Page content */}</Container>
        </>
    );
}
```

## Schema.org Structured Data

Use JSON-LD for structured data (not meta tags, but important for SEO):

```tsx
export default function Product({ loaderData }: Route.ComponentProps) {
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
            availability: 'https://schema.org/InStock'
        }
    };

    return (
        <>
            <title>{product.name} - Iridium</title>
            <meta name="description" content={product.description} />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />

            <Container>{/* Product content */}</Container>
        </>
    );
}
```

### Common Schema Types

- **Product** - E-commerce products
- **Article** - Blog posts, news articles
- **Organization** - Company information
- **Person** - Author/profile pages
- **WebPage** - Generic web pages
- **BreadcrumbList** - Breadcrumb navigation
- **FAQPage** - FAQ pages
- **HowTo** - Tutorial/guide pages

## Special Rendering Behavior

### React 19 Meta Hoisting

React 19 automatically hoists `<title>` and `<meta>` elements to the document `<head>`, regardless of where they're rendered in your component tree.

```tsx
export default function MyRoute() {
    return (
        <Container>
            <div className="content-wrapper">
                {/* These will be hoisted to <head> automatically */}
                <title>Page Title - Iridium</title>
                <meta name="description" content="Description" />

                <h1>Page Content</h1>
                <p>This renders in the body</p>
            </div>
        </Container>
    );
}
```

**Note:** The fragment wrapper (`<>...</>`) is recommended for clarity but not required:

```tsx
// Both patterns work identically
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta name="description" content="Description" />
            <Container>{/* content */}</Container>
        </>
    );
}

export default function MyRoute() {
    return (
        <Container>
            <title>Page Title - Iridium</title>
            <meta name="description" content="Description" />
            {/* content */}
        </Container>
    );
}
```

### Exception: itemProp Meta Tags

Meta tags with `itemProp` (for Schema.org microdata) are NOT hoisted to `<head>`. They remain where rendered:

```tsx
export default function Product() {
    return (
        <section itemScope itemType="https://schema.org/Product">
            <h3>Product Name</h3>
            {/* This stays in the section, not hoisted to <head> */}
            <meta
                itemProp="description"
                content="API reference for using <meta> with itemProp"
            />
            <p>Product content...</p>
        </section>
    );
}
```

## Root Layout Meta Tags

Global meta tags that apply to all pages should be in `app/root.tsx`:

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

export default function Root() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                {/* Global meta tags */}
                <meta name="application-name" content="Iridium" />
                <meta name="theme-color" content="#000000" />

                {/* Route-specific meta tags render here */}
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
```

**Route meta tags override root meta tags.** The route's `<title>` and `<meta>` elements take precedence.

## Best Practices

### ✅ Do

- Use React 19's native `<title>` and `<meta>` elements
- Include title and description on every page
- Keep titles under 60 characters
- Keep descriptions 150-160 characters
- Use dynamic values from loaderData for dynamic pages
- Include Open Graph tags for social sharing
- Add Twitter Card tags for Twitter/X optimization
- Use robots meta tags to control indexing
- Add canonical URLs for duplicate content
- Include structured data (JSON-LD) for rich results
- Place global meta tags in `app/root.tsx`
- Make titles and descriptions unique per page
- Write for users first, search engines second

### ❌ Don't

- Use the legacy `meta()` export function
- Forget to add meta tags to new routes
- Use the same title/description across multiple pages
- Make titles too long (>60 chars)
- Make descriptions too short (<120 chars) or too long (>160 chars)
- Keyword stuff titles or descriptions
- Forget Open Graph images for social sharing
- Use `itemProp` meta tags in `<head>` (they won't hoist)
- Duplicate global meta tags from root in route files
- Index admin/staging pages with search engines

## Real-World Examples

### Homepage

```tsx
import { Container } from '~/components/Container';

export default function Home() {
    return (
        <>
            <title>Iridium</title>
            <meta
                name="description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <meta property="og:title" content="Iridium" />
            <meta
                property="og:description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://yoursite.com" />
            <meta property="og:image" content="https://yoursite.com/og-home.jpg" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Iridium" />
            <meta
                name="twitter:description"
                content="Modern full-stack boilerplate with authentication, billing, and AI"
            />
            <meta name="twitter:image" content="https://yoursite.com/twitter-home.jpg" />

            <Container>{/* Homepage content */}</Container>
        </>
    );
}
```

### Dashboard (Protected Route)

```tsx
import { Container } from '~/components/Container';
import { useAuthenticatedContext } from '~/hooks/useAuthenticatedContext';

export default function Dashboard() {
    const { user } = useAuthenticatedContext();

    return (
        <>
            <title>Dashboard - Iridium</title>
            <meta
                name="description"
                content="Overview of your Iridium account and activity."
            />
            <meta name="robots" content="noindex, nofollow" />

            <Container>
                <h1>Welcome, {user?.name || user?.email}!</h1>
                {/* Dashboard content */}
            </Container>
        </>
    );
}
```

### Dynamic Product Page

```tsx
import type { Route } from './+types/product';
import { Container } from '~/components/Container';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: { category: true }
    });

    if (!product) {
        throw data('Product Not Found', { status: 404 });
    }

    return { product };
}

export default function Product({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;
    const productUrl = `https://yoursite.com/products/${product.slug}`;
    const truncatedDescription = product.description.slice(0, 155);

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.imageUrl,
        brand: {
            '@type': 'Brand',
            name: 'Iridium'
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock'
        }
    };

    return (
        <>
            <title>{product.name} - Iridium</title>
            <meta name="description" content={truncatedDescription} />
            <link rel="canonical" href={productUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={product.name} />
            <meta property="og:description" content={truncatedDescription} />
            <meta property="og:type" content="product" />
            <meta property="og:url" content={productUrl} />
            <meta property="og:image" content={product.imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={product.name} />
            <meta name="twitter:description" content={truncatedDescription} />
            <meta name="twitter:image" content={product.imageUrl} />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />

            <Container>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <p className="text-2xl font-bold">${product.price}</p>
            </Container>
        </>
    );
}
```

### Blog Post

```tsx
import type { Route } from './+types/blog-post';
import { Container } from '~/components/Container';
import { prisma } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {
    const post = await prisma.post.findUnique({
        where: { slug: params.slug },
        include: { author: true }
    });

    if (!post) {
        throw data('Post Not Found', { status: 404 });
    }

    return { post };
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
    const { post } = loaderData;
    const postUrl = `https://yoursite.com/blog/${post.slug}`;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
            '@type': 'Person',
            name: post.author.name
        },
        publisher: {
            '@type': 'Organization',
            name: 'Iridium',
            logo: {
                '@type': 'ImageObject',
                url: 'https://yoursite.com/logo.png'
            }
        }
    };

    return (
        <>
            <title>{post.title} - Iridium Blog</title>
            <meta name="description" content={post.excerpt} />
            <link rel="canonical" href={postUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.excerpt} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={postUrl} />
            <meta property="og:image" content={post.coverImage} />
            <meta property="og:article:published_time" content={post.publishedAt} />
            <meta property="og:article:modified_time" content={post.updatedAt} />
            <meta property="og:article:author" content={post.author.name} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={post.title} />
            <meta name="twitter:description" content={post.excerpt} />
            <meta name="twitter:image" content={post.coverImage} />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />

            <Container>
                <article>
                    <h1>{post.title}</h1>
                    <p className="text-sm text-gray-600">
                        By {post.author.name} on{' '}
                        {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                    <img src={post.coverImage} alt={post.title} />
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
            </Container>
        </>
    );
}
```

## Testing Your Meta Tags

### Browser DevTools

1. Open DevTools (F12 or Cmd+Option+I)
2. Inspect the `<head>` element
3. Verify all meta tags are present and correct
4. Check that route meta tags override root meta tags

### Social Media Preview Tools

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### SEO Tools

- **Google Search Console**: https://search.google.com/search-console
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Lighthouse**: Built into Chrome DevTools (Performance > SEO audit)

## Additional Resources

- **React 19 Meta Docs**: https://react.dev/reference/react-dom/components/meta
- **React Router Meta Docs**: https://reactrouter.com/start/framework/route-module#meta
- **Open Graph Protocol**: https://ogp.me/
- **Twitter Cards Guide**: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- **Schema.org**: https://schema.org/
- **Google SEO Starter Guide**: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

## Related Instructions

- `.github/instructions/react-router.instructions.md` - React Router 7 patterns including meta() legacy pattern
- `.github/instructions/routing.instructions.md` - Route configuration and structure
- `.github/instructions/error-boundaries.instructions.md` - Custom error pages with meta tags
````
