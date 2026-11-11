import { z } from "zod";

const phoneNumberSchema = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Telefon raqamini xalqaro formatda kiriting (+998901234567)");

export const requestPhoneOtpSchema = z.object({
  phoneNumber: phoneNumberSchema,
  telegramConsent: z.literal(true, {
    error: "Telegram orqali tasdiqlash kodini olishga rozilik berishingiz kerak",
  }),
});

export const verifyPhoneOtpSchema = z.object({
  challengeId: z.string().uuid(),
  phoneNumber: phoneNumberSchema,
  code: z.string().trim().regex(/^\d{4,8}$/, "Tasdiqlash kodi 4–8 ta raqamdan iborat bo'lishi kerak"),
});
