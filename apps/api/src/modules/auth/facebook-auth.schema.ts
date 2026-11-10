import { z } from "zod";

export const facebookAuthSchema = z.object({
  accessToken: z.string().trim().min(1, "Facebook access token is required").max(4096),
});

export type FacebookAuthInput = z.infer<typeof facebookAuthSchema>;
