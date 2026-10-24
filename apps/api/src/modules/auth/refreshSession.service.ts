import { UnauthorizedError } from "../../shared/errors.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";


const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const refreshSessionService = {
  async refresh(rawToken: string) {
    if (!rawToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const oldTokenHash = refreshTokenService.hash(rawToken);
    const newRefreshToken = refreshTokenService.generate();
    const newTokenHash = refreshTokenService.hash(newRefreshToken);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const userId = await refreshTokenRepository.rotate({
      oldTokenHash,
      newTokenHash,
      expiresAt,
    });

    if (!userId) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = tokenService.sign(userId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },
};