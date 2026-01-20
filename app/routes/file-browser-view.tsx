import { useNavigation } from 'react-router';
import type { Route } from './+types/file-browser-view';
import { Alert } from '~/components/feedback/Alert';
import { createSignedDownloadUrl } from '~/lib/s3.server';

const SIGNED_URL_TTL_SECONDS = 900;

function getFileExtension(key: string) {
    const parts = key.split('.');
    return parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() : null;
}

function isImageKey(key: string) {
    const extension = getFileExtension(key);
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(
        extension ?? '',
    );
}

function isPreviewableInline(key: string) {
    const extension = getFileExtension(key);
    return ['pdf'].includes(extension ?? '');
}

export async function loader({ params }: Route.LoaderArgs) {
    const encodedKey = params['*'];
    if (!encodedKey) {
        throw new Response('Missing object key', { status: 400 });
    }

    const key = decodeURIComponent(encodedKey);
    const signedUrl = await createSignedDownloadUrl({
        key,
        expiresIn: SIGNED_URL_TTL_SECONDS,
    });

    return { key, signedUrl };
}

export default function FileBrowserViewRoute({
    loaderData,
}: Route.ComponentProps) {
    const showImage = isImageKey(loaderData.key);
    const showInline = isPreviewableInline(loaderData.key);
    const navigation = useNavigation();
    const isNavigating = navigation.state === 'loading';

    return (
        <div className="flex h-full flex-col gap-4 rounded-box bg-base-200 p-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-semibold">Preview</h3>
                <p className="text-xs text-base-content/70 break-all">
                    {loaderData.key}
                </p>
                <p className="text-sm text-base-content/70">
                    Presigned link expires in 15 minutes.
                </p>
            </div>
            {isNavigating ? (
                <div className="flex items-center justify-center rounded-box bg-base-100 h-[420px]">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : showImage ? (
                <div className="overflow-hidden rounded-box bg-base-100 p-8">
                    <img
                        src={loaderData.signedUrl}
                        alt={loaderData.key}
                        className="w-full max-h-[420px] object-contain"
                    />
                </div>
            ) : showInline ? (
                <div className="overflow-hidden rounded-box bg-base-100">
                    <iframe
                        src={loaderData.signedUrl}
                        title={loaderData.key}
                        className="h-[420px] w-full"
                    />
                </div>
            ) : (
                <Alert status="info">
                    This file type does not support inline preview. Use the
                    button below to open it in a new tab.
                </Alert>
            )}
            <a
                href={loaderData.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="link link-primary"
            >
                Open in new tab
            </a>
        </div>
    );
}
