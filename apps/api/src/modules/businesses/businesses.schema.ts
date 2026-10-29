import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().trim().min(1).max(150),
});

export type CreateBusinessInput = z.infer<
  typeof createBusinessSchema
>;