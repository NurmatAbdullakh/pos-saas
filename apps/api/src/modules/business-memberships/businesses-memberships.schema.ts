
import { z } from "zod";

export const businessMembershipSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["owner", "manager", "cashier"]),
  created_at: z.coerce.date(),
});

export type CreateBusinessMembershipInput = z.infer<
  typeof businessMembershipSchema
>;
