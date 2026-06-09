type Props = {
    title: string;
    description: string;
    /** Absolute URL of the page, for og:url and canonical. */
    url?: string;
    /** Absolute URL of a social preview image. */
    image?: string;
};

/**
 * Open Graph + Twitter meta tags, rendered inline in route JSX alongside the
 * existing <title>/<meta name="description"> convention.
 */
export function OgMeta({ title, description, url, image }: Props) {
    return (
        <>
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {url && <meta property="og:url" content={url} />}
            {url && <link rel="canonical" href={url} />}
            {image && <meta property="og:image" content={image} />}
            <meta
                name="twitter:card"
                content={image ? 'summary_large_image' : 'summary'}
            />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </>
    );
}
