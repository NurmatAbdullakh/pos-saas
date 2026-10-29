import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().trim().min(1).max(150),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;