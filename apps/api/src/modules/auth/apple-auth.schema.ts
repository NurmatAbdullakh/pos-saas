import { z } from "zod";

export const appleAuthSchema = z.object({
  code: z.string().trim().min(1).max(4096),
  nonce: z.string().trim().min(16).max(256),
  redirectUri: z.string().url(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
});

export type AppleAuthInput = z.infer<typeof appleAuthSchema>;
