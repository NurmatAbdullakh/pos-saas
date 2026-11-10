import { z } from "zod";

export const membershipSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(12, "Password must be at least 12 characters").max(128),
  role: z.enum(["manager", "cashier"]),
});

export type MembershipFormValues = z.infer<typeof membershipSchema>;
