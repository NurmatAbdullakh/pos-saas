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

    const session = await refreshTokenRepository.rotate({
      oldTokenHash,
      newTokenHash,
      expiresAt,
    });

    if (!session) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const accessToken = tokenService.sign(session.userId, session.authProvider);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      authProvider: session.authProvider,
    };
  },
};
