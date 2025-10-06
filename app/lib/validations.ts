import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const chatMessageSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().max(100, "Location must be 100 characters or less").optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;