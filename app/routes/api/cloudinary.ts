import { v2 as cloudinary } from 'cloudinary';
import type { Route } from './+types/cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        try {
            const formData = await request.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return Response.json(
                    { error: 'No file provided' },
                    { status: 400 },
                );
            }

            // Convert file to base64 for Cloudinary upload
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(base64String, {
                resource_type: 'auto', // Automatically detect file type
                folder: 'iridium', // Optional: organize uploads in a folder
                use_filename: true,
                unique_filename: true,
            });

            return Response.json({
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                created_at: result.created_at,
            });
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return Response.json(
                {
                    error: 'Upload failed',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                },
                { status: 500 },
            );
        }
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
