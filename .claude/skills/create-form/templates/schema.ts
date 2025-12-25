/**
 * Template: Zod Validation Schema
 *
 * Add these schemas to app/lib/validations.ts
 */

import { z } from 'zod';

// ============================================
// Basic Form Schema
// ============================================
export const basicFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type BasicFormData = z.infer<typeof basicFormSchema>;

// ============================================
// Profile Update Schema
// ============================================
export const profileUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    location: z.string().max(100, 'Location too long').optional(),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// ============================================
// Create/Update Pattern (CRUD)
// ============================================
export const createItemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().default(false),
    tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
});

export type CreateItemData = z.infer<typeof createItemSchema>;

// Update schema - all fields optional
export const updateItemSchema = createItemSchema.partial();
export type UpdateItemData = z.infer<typeof updateItemSchema>;

// ============================================
// Conditional Validation
// ============================================
export const shippingSchema = z
    .object({
        sameAsBilling: z.boolean(),
        shippingAddress: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingZip: z.string().optional(),
    })
    .refine(
        (data) =>
            data.sameAsBilling ||
            (data.shippingAddress && data.shippingCity && data.shippingZip),
        {
            message: 'Shipping address is required when different from billing',
            path: ['shippingAddress'],
        }
    );

export type ShippingData = z.infer<typeof shippingSchema>;

// ============================================
// File Upload Schema
// ============================================
export const fileUploadSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    file: z
        .custom<FileList>()
        .refine((files) => files?.length > 0, 'File is required')
        .refine(
            (files) => files?.[0]?.size < 5_000_000,
            'File must be less than 5MB'
        )
        .refine(
            (files) =>
                ['image/jpeg', 'image/png', 'application/pdf'].includes(
                    files?.[0]?.type
                ),
            'Only JPEG, PNG, and PDF files allowed'
        ),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

// ============================================
// Password Validation (for auth forms)
// ============================================
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number');

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
