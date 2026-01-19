import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface S3Config {
    bucket: string;
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
}

let s3Client: S3Client | null = null;

export interface S3ObjectSummary {
    key: string;
    size: number;
    lastModified: string | null;
}

function getS3Config(): S3Config {
    const bucket = process.env.AWS_BUCKET_NAME;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucket || !accessKeyId || !secretAccessKey) {
        throw new Error(
            'S3 bucket credentials are missing. Set AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.',
        );
    }

    return {
        bucket,
        accessKeyId,
        secretAccessKey,
        endpoint: process.env.AWS_ENDPOINT_URL ?? 'https://storage.railway.app',
        region: process.env.AWS_DEFAULT_REGION ?? 'auto',
        forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true',
    };
}

function getS3Client(): S3Client {
    if (!s3Client) {
        const {
            endpoint,
            region,
            accessKeyId,
            secretAccessKey,
            forcePathStyle,
        } = getS3Config();

        s3Client = new S3Client({
            region,
            endpoint,
            forcePathStyle,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    return s3Client;
}

export async function uploadObject({
    key,
    body,
    contentType,
}: {
    key: string;
    body: Uint8Array;
    contentType?: string;
}) {
    const { bucket } = getS3Config();
    const client = getS3Client();

    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        }),
    );
}

export async function createSignedDownloadUrl({
    key,
    expiresIn = 3600,
}: {
    key: string;
    expiresIn?: number;
}) {
    const { bucket } = getS3Config();
    const client = getS3Client();

    return getSignedUrl(
        client,
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
        { expiresIn },
    );
}

export async function listObjects({
    prefix,
    maxKeys = 200,
}: {
    prefix?: string;
    maxKeys?: number;
}): Promise<S3ObjectSummary[]> {
    const { bucket } = getS3Config();
    const client = getS3Client();

    const response = await client.send(
        new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            MaxKeys: maxKeys,
        }),
    );

    return (
        response.Contents?.filter((item) => item.Key).map((item) => ({
            key: item.Key ?? '',
            size: item.Size ?? 0,
            lastModified: item.LastModified
                ? item.LastModified.toISOString()
                : null,
        })) ?? []
    );
}
