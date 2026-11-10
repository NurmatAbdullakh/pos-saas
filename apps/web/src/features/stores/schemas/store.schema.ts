import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().trim().min(2, "Store name must be at least 2 characters").max(150),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
