---
applyTo: 'app/routes/*.tsx'
---

# SEO & Meta Tags

## React 19 Pattern (REQUIRED)

Use native `<title>` and `<meta>` elements directly in component JSX. **DO NOT use the legacy `meta()` export.**

```tsx
export default function MyRoute() {
    return (
        <>
            <title>Page Title - Iridium</title>
            <meta name="description" content="Page description" />
            <Container>{/* Page content */}</Container>
        </>
    );
}
```

React 19 automatically hoists `<title>` and `<meta>` to `<head>`.

## Title & Description

- **Title format:** `[Page Name] - Iridium` (homepage can be just `Iridium`)
- **Title length:** Under 60 characters
- **Description length:** 150–160 characters
- **Each page** should have a unique title and description

## Dynamic Meta from Loader Data

```tsx
export default function Product({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;
    return (
        <>
            <title>{product.name} - Iridium</title>
            <meta name="description" content={product.description.slice(0, 155)} />
            <Container>{/* ... */}</Container>
        </>
    );
}
```

## Open Graph (Social Sharing)

```tsx
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Description for social sharing" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yoursite.com/page" />
<meta property="og:image" content="https://yoursite.com/og-image.jpg" />
```

OG images: 1200×630px, JPG/PNG, under 1MB.

## Robots & Canonical

```tsx
// Prevent indexing (admin/private pages)
<meta name="robots" content="noindex, nofollow" />

// Canonical URL for duplicate content
<link rel="canonical" href={canonicalUrl} />
```

## Structured Data (JSON-LD)

```tsx
<script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
```

## Rules

- **Use React 19 `<title>`/`<meta>`** — never the legacy `meta()` export
- **Global meta tags** in `app/root.tsx` only (charset, viewport)
- **Route meta overrides root meta** automatically
- **`itemProp` meta tags** are NOT hoisted — they stay where rendered
- **Write for users first**, search engines second
