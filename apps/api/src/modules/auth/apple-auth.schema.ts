import { z } from "zod";

export const appleAuthSchema = z.object({
  code: z.string().trim().min(1, "Apple authorization code is required").max(4096),
  nonce: z.string().trim().min(16).max(256),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
});
