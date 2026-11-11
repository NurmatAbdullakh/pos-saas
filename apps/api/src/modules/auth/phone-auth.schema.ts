import { z } from "zod";

export const requestPhoneOtpSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Telefon raqamini xalqaro formatda kiriting (+998901234567)"),
});
export const verifyPhoneOtpSchema = z.object({
  challengeId: z.string().uuid(),
  phoneNumber: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
  code: z.string().regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
});
