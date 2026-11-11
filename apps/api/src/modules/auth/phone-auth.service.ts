import { UnauthorizedError } from "../../shared/errors.js";
import { env } from "../../config/env.js";
import { phoneAuthRepository } from "./phone-auth.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";
import { telegramService } from "./telegram.service.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const phoneAuthService = {
  async requestOtp(phoneNumber: string) {
    const linked = await phoneAuthRepository.findTelegramAccount(phoneNumber);
    const otp = linked ? telegramService.generateOtp() : null;
    const linkToken = linked ? null : telegramService.generateLinkToken();
    const challengeId = await phoneAuthRepository.createChallenge({
      phoneNumber,
      otpHash: otp ? telegramService.hash(otp) : null,
      linkTokenHash: linkToken ? telegramService.hash(linkToken) : null,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      resendAfter: new Date(Date.now() + RESEND_COOLDOWN_MS),
    });

    if (linked && otp) {
      await telegramService.sendOtp(Number(linked.chat_id), otp);
      return { challengeId, status: "otp_sent" as const, expiresIn: 300 };
    }
    return {
      challengeId,
      status: "awaiting_telegram" as const,
      telegramUrl: telegramService.getStartLink(linkToken!),
      expiresIn: 300,
    };
  },

  async handleTelegramUpdate(update: any) {
    const message = update?.message;
    if (!message?.chat?.id || !message?.from?.id) return;
    const text: string = typeof message.text === "string" ? message.text : "";
    const startToken = text.match(/^\/start\s+([A-Za-z0-9_-]{20,})$/)?.[1];
    if (startToken) {
      await telegramService.askForContact(Number(message.chat.id));
      // Telegram does not echo /start payload with the next contact update.
      // Keep the token-to-chat association in the challenge until contact arrives.
      const { bindStartSession } = await import("./telegram-start-session.js");
      bindStartSession(Number(message.from.id), Number(message.chat.id), telegramService.hash(startToken));
      return;
    }

    const contact = message.contact;
    if (!contact?.phone_number || !contact?.user_id || Number(contact.user_id) !== Number(message.from.id)) return;
    const phoneNumber = normalizePhone(contact.phone_number);
    const { takeStartSession } = await import("./telegram-start-session.js");
    const session = takeStartSession(Number(message.from.id));
    if (!session) return;

    const linked = await phoneAuthRepository.bindTelegramContact({
      tokenHash: session.tokenHash,
      phoneNumber,
      telegramUserId: Number(message.from.id),
      chatId: Number(message.chat.id),
    });
    if (!linked) return;

    const otp = telegramService.generateOtp();
    const { findChallengeByTelegram } = await import("./phone-auth.repository.js");
    const challenge = await findChallengeByTelegram(session.tokenHash, phoneNumber);
    if (!challenge) return;
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await phoneAuthRepository.setOtp(challenge.id, telegramService.hash(otp), expiresAt, new Date(Date.now() + RESEND_COOLDOWN_MS));
    await telegramService.sendOtp(Number(message.chat.id), otp);
  },

  async verifyOtp(input: { challengeId: string; phoneNumber: string; code: string }) {
    const challenge = await phoneAuthRepository.findChallenge(input.challengeId);
    if (!challenge || challenge.phone_number !== input.phoneNumber ||
        !challenge.otp_hash || !challenge.telegram_user_id || !challenge.telegram_chat_id ||
        challenge.attempts >= 5 || challenge.expires_at.getTime() <= Date.now() ||
        challenge.consumed_at || telegramService.hash(input.code) !== challenge.otp_hash) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }

    const refreshToken = refreshTokenService.generate();
    const user = await phoneAuthRepository.consumeAndCreateSession({
      challengeId: challenge.id,
      otpHash: challenge.otp_hash,
      phoneNumber: input.phoneNumber,
      telegramUserId: challenge.telegram_user_id,
      chatId: challenge.telegram_chat_id,
      refreshTokenHash: refreshTokenService.hash(refreshToken),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    if (!user) throw new UnauthorizedError("Invalid or expired verification code");

    return {
      user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at, authProvider: "password" as const },
      accessToken: tokenService.sign(user.id, "password"),
      refreshToken,
    };
  },
};

function normalizePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return `+${digits}`;
}
