import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Business name must be at least 2 characters").max(150),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;
