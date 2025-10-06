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

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;