# Image Handling with Cloudinary

Complete guide to handling file uploads in Iridium using Cloudinary.

---

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| [Basic Upload](#basic-upload) | Single image upload with preview |
| [Profile Picture](#profile-picture-example) | User avatar upload |
| [Multiple Images](#multiple-images) | Gallery or product images |
| [Image Transformations](#image-transformations) | Resize, crop, optimize |
| [Direct Upload](#direct-upload-client-side) | Client-side upload (advanced) |

---

## Setup

### 1. Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. Add Environment Variables

Add to `.env`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Verify API Endpoint

Iridium includes a Cloudinary API endpoint at `app/routes/api/cloudinary.ts`. This handles:
- File validation
- Base64 encoding
- Upload to Cloudinary
- Error handling

**You don't need to modify this file** - it works out of the box.

---

## Basic Upload

Simple file upload with Cloudinary.

### 1. Create Form UI

```typescript
// app/routes/upload-example.tsx
import { Form } from 'react-router';
import type { Route } from './+types/upload-example';
import { Container } from '~/components/Container';
import { FileInput } from '~/components/FileInput';
import { Button } from '~/components/Button';
import { useState } from 'react';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
        return { error: 'Please select a file' };
    }

    try {
        // Upload to Cloudinary via our API
        const baseUrl = new URL(request.url).origin;
        const response = await fetch(new URL('/api/cloudinary', baseUrl), {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Upload failed' };
        }

        // Success! You now have the image URL
        return { success: true, imageUrl: data.url, upload: data };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

export default function UploadExampleRoute({
    actionData,
}: Route.ComponentProps) {
    return (
        <Container>
            <h1 className="text-3xl font-bold mb-6">Upload Image</h1>

            <Form
                method="POST"
                encType="multipart/form-data"
                className="space-y-4"
            >
                <FileInput
                    name="file"
                    label="Choose Image"
                    accept=".png,.jpg,.jpeg,.webp"
                    error={actionData?.error}
                />

                <Button type="submit" status="primary">
                    Upload
                </Button>

                {actionData?.success && (
                    <div className="mt-4">
                        <p className="text-green-600 mb-2">
                            Upload successful!
                        </p>
                        <img
                            src={actionData.imageUrl}
                            alt="Uploaded"
                            className="max-w-sm rounded-lg"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                            URL: {actionData.imageUrl}
                        </p>
                    </div>
                )}
            </Form>
        </Container>
    );
}
```

### 2. Register Route

Add to `app/routes.ts`:

```typescript
layout('routes/authenticated.tsx', [
    route('/upload-example', 'routes/upload-example.tsx'),
]),
```

---

## Profile Picture Example

Complete profile picture upload with preview and database storage.

### 1. Add to User Model

```typescript
// prisma/schema.prisma
model User {
  // ... existing fields ...
  avatarUrl    String?
  avatarPublicId String?  // Store Cloudinary public_id for deletions
}
```

Run migration:

```bash
npx prisma migrate dev --name add_user_avatar
npx prisma generate
```

### 2. Update User Model

```typescript
// app/models/user.server.ts
export async function updateUserAvatar(
    userId: string,
    avatarUrl: string,
    avatarPublicId: string,
) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            avatarUrl,
            avatarPublicId,
        },
    });
}
```

### 3. Create Avatar Upload Route

```typescript
// app/routes/profile/avatar.tsx
import { useFetcher } from 'react-router';
import type { Route } from './+types/avatar';
import { requireUser } from '~/lib/session.server';
import { updateUserAvatar } from '~/models/user.server';
import { FileInput } from '~/components/FileInput';
import { Button } from '~/components/Button';
import { Avatar } from '~/components/Avatar';
import { data } from 'react-router';

export async function action({ request }: Route.ActionArgs) {
    const user = await requireUser(request);
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file || file.size === 0) {
        return data({ error: 'Please select a file' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return data({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return data(
            { error: 'Invalid file type (only JPG, PNG, WEBP)' },
            { status: 400 },
        );
    }

    try {
        const baseUrl = new URL(request.url).origin;
        const response = await fetch(new URL('/api/cloudinary', baseUrl), {
            method: 'POST',
            body: formData,
        });

        const uploadData = await response.json();

        if (!response.ok) {
            return data(
                { error: uploadData.error || 'Upload failed' },
                { status: 500 },
            );
        }

        // Update user in database
        await updateUserAvatar(user.id, uploadData.url, uploadData.public_id);

        return data({
            success: true,
            avatarUrl: uploadData.url,
            message: 'Avatar updated successfully',
        });
    } catch (error) {
        return data(
            { error: 'Failed to update avatar' },
            { status: 500 },
        );
    }
}

export default function AvatarUploadRoute({
    actionData,
}: Route.ComponentProps) {
    const fetcher = useFetcher();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Update Profile Picture</h2>

            <fetcher.Form
                method="POST"
                encType="multipart/form-data"
                className="space-y-4"
            >
                <FileInput
                    name="avatar"
                    label="Choose Avatar"
                    accept=".png,.jpg,.jpeg,.webp"
                    helperText="Max 5MB. JPG, PNG or WEBP."
                    error={actionData?.error}
                />

                <Button
                    type="submit"
                    status="primary"
                    disabled={fetcher.state === 'submitting'}
                >
                    {fetcher.state === 'submitting'
                        ? 'Uploading...'
                        : 'Upload Avatar'}
                </Button>

                {actionData?.success && (
                    <div className="flex items-center gap-4">
                        <Avatar src={actionData.avatarUrl} size="lg" />
                        <p className="text-green-600">{actionData.message}</p>
                    </div>
                )}
            </fetcher.Form>
        </div>
    );
}
```

---

## Multiple Images

Upload multiple images (e.g., product gallery).

### 1. Schema

```prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  images    String[] // Array of Cloudinary URLs
  createdAt DateTime @default(now())
}
```

### 2. Upload Multiple Files

```typescript
// app/routes/products/upload-gallery.tsx
import { useState } from 'react';

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
        return { error: 'Please select at least one image' };
    }

    // Upload all images
    const uploadPromises = files.map(async (file) => {
        const fileFormData = new FormData();
        fileFormData.append('file', file);

        const response = await fetch(
            new URL('/api/cloudinary', new URL(request.url).origin),
            {
                method: 'POST',
                body: fileFormData,
            },
        );

        return response.json();
    });

    try {
        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map((r) => r.url);

        // Save to database
        // await createProduct({ name, images: imageUrls });

        return { success: true, images: imageUrls };
    } catch (error) {
        return { error: 'Failed to upload images' };
    }
}

export default function GalleryUploadRoute({
    actionData,
}: Route.ComponentProps) {
    const [previews, setPreviews] = useState<string[]>([]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
    }

    return (
        <Form method="POST" encType="multipart/form-data">
            <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
            />

            {/* Preview */}
            {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                    {previews.map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt={`Preview ${i + 1}`}
                            className="rounded-lg"
                        />
                    ))}
                </div>
            )}

            <Button type="submit">Upload All</Button>
        </Form>
    );
}
```

---

## Image Transformations

Cloudinary provides powerful URL-based transformations.

### Resize & Crop

```typescript
// Original image
const originalUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

// Transform URLs
const thumbnailUrl = originalUrl.replace(
    '/upload/',
    '/upload/w_200,h_200,c_fill/',
);

const squareUrl = originalUrl.replace(
    '/upload/',
    '/upload/w_400,h_400,c_crop,g_face/',
);

const optimizedUrl = originalUrl.replace(
    '/upload/',
    '/upload/q_auto,f_auto/',
);
```

### Common Transformations

```typescript
// Create a helper function
export function transformCloudinaryUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'crop' | 'scale';
        quality?: 'auto' | number;
        format?: 'auto' | 'jpg' | 'png' | 'webp';
        gravity?: 'face' | 'center' | 'auto';
    },
) {
    const transformations: string[] = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.gravity) transformations.push(`g_${options.gravity}`);

    const transform = transformations.join(',');
    return url.replace('/upload/', `/upload/${transform}/`);
}

// Usage
const thumbnail = transformCloudinaryUrl(originalUrl, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
});
```

### Avatar Component with Transforms

```typescript
// app/components/CloudinaryAvatar.tsx
interface CloudinaryAvatarProps {
    url: string;
    size?: 'sm' | 'md' | 'lg';
    alt: string;
}

export function CloudinaryAvatar({ url, size = 'md', alt }: CloudinaryAvatarProps) {
    const sizeMap = { sm: 40, md: 80, lg: 150 };
    const dimension = sizeMap[size];

    const transformedUrl = url.replace(
        '/upload/',
        `/upload/w_${dimension},h_${dimension},c_fill,g_face,q_auto,f_auto/`,
    );

    return (
        <img
            src={transformedUrl}
            alt={alt}
            width={dimension}
            height={dimension}
            className="rounded-full object-cover"
        />
    );
}
```

---

## Direct Upload (Client-Side)

For advanced use cases, upload directly from browser to Cloudinary.

### 1. Generate Upload Signature (Server)

```typescript
// app/routes/api/cloudinary-signature.ts
import { v2 as cloudinary } from 'cloudinary';
import type { Route } from './+types/cloudinary-signature';
import { requireUser } from '~/lib/session.server';

export async function action({ request }: Route.ActionArgs) {
    await requireUser(request); // Auth required

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            folder: 'iridium',
        },
        process.env.CLOUDINARY_API_SECRET!,
    );

    return Response.json({
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
    });
}
```

### 2. Client-Side Upload

```typescript
// app/routes/direct-upload-example.tsx
import { useState } from 'react';
import { useFetcher } from 'react-router';

export default function DirectUploadRoute() {
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const signatureFetcher = useFetcher();

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        // Get signature from server
        signatureFetcher.submit(null, {
            method: 'POST',
            action: '/api/cloudinary-signature',
        });

        // Wait for signature (this is simplified - use proper state management)
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { signature, timestamp, cloudName, apiKey } =
            signatureFetcher.data as any;

        // Upload directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        formData.append('folder', 'iridium');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            },
        );

        const data = await response.json();
        setImageUrl(data.secure_url);
        setUploading(false);
    }

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="Uploaded" />}
        </div>
    );
}
```

---

## Best Practices

### ✅ DO

- **Validate file size** - Prevent huge uploads (max 5-10MB)
- **Validate file type** - Only allow images
- **Show upload progress** - Better UX with loading states
- **Optimize images** - Use `q_auto,f_auto` transformations
- **Store public_id** - Needed to delete images later
- **Use folders** - Organize uploads (`folder: 'iridium'`)
- **Handle errors** - Show user-friendly error messages

### ❌ DON'T

- **Don't skip server validation** - Client validation isn't enough
- **Don't expose API secret** - Only in server-side code
- **Don't forget to clean up** - Delete old images when replacing
- **Don't hardcode URLs** - Store in database
- **Don't upload without auth** - Require authenticated users

---

## Testing Image Uploads

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test('uploads avatar successfully', async ({ page }) => {
    await page.goto('/profile/avatar');

    // Prepare test image
    const filePath = path.join(__dirname, 'fixtures', 'test-avatar.jpg');

    // Upload file
    await page.setInputFiles('input[name="avatar"]', filePath);
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.getByText('Avatar updated successfully')).toBeVisible();

    // Verify image renders
    const avatar = page.locator('img[alt*="avatar"]');
    await expect(avatar).toBeVisible();
});
```

---

## Deleting Images

When replacing or deleting images, clean up Cloudinary.

### Delete Function

```typescript
// app/lib/cloudinary.server.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteCloudinaryImage(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: result.result === 'ok' };
    } catch (error) {
        console.error('Failed to delete image:', error);
        return { success: false };
    }
}
```

### Usage in Route

```typescript
// Before updating avatar
if (user.avatarPublicId) {
    await deleteCloudinaryImage(user.avatarPublicId);
}

// Then upload new avatar
```

---

## Troubleshooting

### Upload Fails Silently

**Check:**
1. Environment variables are set correctly
2. Cloudinary account has upload quota remaining
3. File size is within limits
4. Network request succeeded (check browser DevTools)

### Images Don't Display

**Check:**
1. URL is correct and accessible
2. Cloudinary account is active
3. Image isn't deleted from Cloudinary
4. CORS settings if loading cross-origin

### Transformations Don't Work

**Check:**
1. URL format is correct
2. Transformation string is valid
3. Cloudinary plan supports transformations

---

## Next Steps

- [FORM_BUILDING.md](FORM_BUILDING.md) - Form patterns for uploads
- [BUILD_YOUR_FIRST_FEATURE.md](BUILD_YOUR_FIRST_FEATURE.md) - Complete CRUD tutorial
- [`app/routes/api/cloudinary.ts`](app/routes/api/cloudinary.ts) - API implementation
- [`app/routes/admin/design.tsx`](app/routes/admin/design.tsx) - Working example
- [Cloudinary Docs](https://cloudinary.com/documentation) - Full transformation reference