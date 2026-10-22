import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(12, "Password must contain at least 12 characters")
    .max(128, "Password must be at most 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;