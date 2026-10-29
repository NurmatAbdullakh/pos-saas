
import { z } from "zod";
import { MemberRoles } from "../../shared/constants.js";

export const businessMembershipSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum([MemberRoles.owner, MemberRoles.manager, MemberRoles.cashier]),
  created_at: z.coerce.date(),
});

export type CreateBusinessMembershipInput = z.infer<
  typeof businessMembershipSchema
>;
