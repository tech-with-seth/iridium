import { z } from 'zod';

export const signInSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Za-z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const chatMessageSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
        }),
    ),
});

export const profileUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z
        .string()
        .max(500, 'Bio must be 500 characters or less')
        .optional()
        .or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    location: z
        .string()
        .max(100, 'Location must be 100 characters or less')
        .optional()
        .or(z.literal('')),
    phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional()
        .or(z.literal('')),
});

export const supportRequestSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    subject: z.string().min(1, 'Please select a subject'),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], {
        errorMap: () => ({ message: 'Please select a priority' }),
    }),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must be 1000 characters or less'),
    subscribe: z.coerce.boolean().optional(),
});

// EMAIL VALIDATION SCHEMAS

export const sendEmailSchema = z
    .object({
        to: z.union([
            z.string().email('Invalid recipient email address'),
            z.array(z.string().email('Invalid recipient email address')),
        ]),
        from: z.string().email('Invalid sender email address').optional(),
        subject: z
            .string()
            .min(1, 'Subject is required')
            .max(200, 'Subject must be 200 characters or less'),
        html: z.string().min(1, 'Email body is required').optional(),
        text: z.string().min(1, 'Email body is required').optional(),
        replyTo: z.string().email('Invalid reply-to email address').optional(),
        cc: z
            .union([
                z.string().email('Invalid CC email address'),
                z.array(z.string().email('Invalid CC email address')),
            ])
            .optional(),
        bcc: z
            .union([
                z.string().email('Invalid BCC email address'),
                z.array(z.string().email('Invalid BCC email address')),
            ])
            .optional(),
    })
    .refine((data) => data.html || data.text, {
        message: "Either 'html' or 'text' must be provided",
        path: ['html'],
    });

export const emailTemplateSchema = z.object({
    templateName: z.enum([
        'verification',
        'password-reset',
        'welcome',
        'transactional',
    ]),
    to: z.string().email('Invalid recipient email address'),
    props: z.record(z.any()).optional(),
});

export const interestFormSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    inquiryType: z.enum(['general', 'business']),
    note: z.string().max(500, 'Note must be 500 characters or less').optional(),
});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type SupportRequestData = z.infer<typeof supportRequestSchema>;
export type SendEmailData = z.infer<typeof sendEmailSchema>;
export type EmailTemplateData = z.infer<typeof emailTemplateSchema>;
export type InterestFormData = z.infer<typeof interestFormSchema>;
