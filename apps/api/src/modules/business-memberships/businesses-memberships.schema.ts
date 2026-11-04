
import { z } from "zod";
import { MemberRoles } from "../../shared/constants.js";

export const businessMembershipSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum([MemberRoles.owner, MemberRoles.manager, MemberRoles.cashier]),
  created_at: z.coerce.date(),
});

export const businessMembershipCreateBodySchema = z.object({
    role: z.enum([MemberRoles.owner, MemberRoles.manager, MemberRoles.cashier]),
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
})

export type CreateBusinessMembershipInput = z.infer<
  typeof businessMembershipCreateBodySchema
>;
