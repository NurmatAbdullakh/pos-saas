import { createHmac, randomInt, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";

const TELEGRAM_API = "https://api.telegram.org";

function requireTelegramConfig() {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_BOT_USERNAME) {
    throw new Error("Telegram authentication is not configured");
  }
}

async function telegramRequest<T>(method: string, body: Record<string, unknown>): Promise<T> {
  requireTelegramConfig();
  const response = await fetch(`${TELEGRAM_API}/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as { ok: boolean; result: T; description?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.description || "Telegram API request failed");
  return payload.result;
}

export const telegramService = {
  generateOtp(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  },
  generateLinkToken(): string {
    return randomBytes(32).toString("base64url");
  },
  hash(value: string): string {
    return createHmac("sha256", env.OTP_SECRET || env.JWT_SECRET).update(value).digest("hex");
  },
  getStartLink(token: string): string {
    requireTelegramConfig();
    return `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(token)}`;
  },
  async askForContact(chatId: number) {
    await telegramRequest("sendMessage", {
      chat_id: chatId,
      text: "Telefon raqamingizni tasdiqlash uchun quyidagi tugmani bosing. Faqat o'zingizning kontaktingiz qabul qilinadi.",
      reply_markup: {
        keyboard: [[{ text: "📱 Telefon raqamimni ulashish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  },
  async sendOtp(chatId: number, otp: string) {
    await telegramRequest("sendMessage", {
      chat_id: chatId,
      text: `POS SaaS tasdiqlash kodingiz: ${otp}\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`,
      reply_markup: { remove_keyboard: true },
    });
  },
};
