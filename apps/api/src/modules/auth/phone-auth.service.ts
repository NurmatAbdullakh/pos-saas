import { TooManyRequestsError, UnauthorizedError } from "../../shared/errors.js";
import { phoneAuthRepository } from "./phone-auth.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";
import { telegramGatewayService } from "./telegram-gateway.service.js";

const OTP_TTL_SECONDS = 300;
const OTP_TTL_MS = OTP_TTL_SECONDS * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const phoneAuthService = {
  async requestOtp(phoneNumber: string) {
    if (await phoneAuthRepository.countRecentChallenges(phoneNumber) >= 5) {
      throw new TooManyRequestsError("Too many OTP requests. Try again in 15 minutes.");
    }

    const gatewayRequest = await telegramGatewayService.sendVerificationMessage(phoneNumber);
    const challengeId = await phoneAuthRepository.createChallenge({
      phoneNumber,
      gatewayRequestId: gatewayRequest.request_id,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    return {
      challengeId,
      status: "otp_sent" as const,
      expiresIn: OTP_TTL_SECONDS,
    };
  },

  async verifyOtp(input: { challengeId: string; phoneNumber: string; code: string }) {
    const challenge = await phoneAuthRepository.findChallenge(input.challengeId);
    if (
      !challenge ||
      !challenge.gateway_request_id ||
      challenge.phone_number !== input.phoneNumber ||
      challenge.attempts >= 5 ||
      challenge.expires_at.getTime() <= Date.now() ||
      challenge.consumed_at
    ) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }

    const verification = await telegramGatewayService.checkVerificationStatus(
      challenge.gateway_request_id,
      input.code,
    );
    const status = verification.verification_status?.status;

    if (status !== "code_valid") {
      await phoneAuthRepository.incrementAttempt(challenge.id);
      throw new UnauthorizedError(
        status === "expired"
          ? "Verification code has expired"
          : "Invalid or expired verification code",
      );
    }

    const refreshToken = refreshTokenService.generate();
    const user = await phoneAuthRepository.consumeAndCreateSession({
      challengeId: challenge.id,
      phoneNumber: input.phoneNumber,
      refreshTokenHash: refreshTokenService.hash(refreshToken),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    if (!user) throw new UnauthorizedError("Invalid or expired verification code");

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        authProvider: "password" as const,
      },
      accessToken: tokenService.sign(user.id, "password"),
      refreshToken,
    };
  },
};
