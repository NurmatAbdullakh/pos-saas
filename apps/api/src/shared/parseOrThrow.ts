
import { z } from "zod";
import { ValidationError } from "./errors.js";

export function parseOrThrow<S extends z.ZodType>(
  data: unknown,
  schema: S,
): z.output<S> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }

  return result.data;
}
