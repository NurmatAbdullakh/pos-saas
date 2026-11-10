import { ExistsError } from "../../shared/errors.js";
import { googleIdentityRepository } from "./google-identity.repository.js";
import { googleTokenService } from "./google-token.service.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const googleAuthService = {
  async login(idToken: string) {
    const profile = await googleTokenService.verify(idToken);

    let user = await googleIdentityRepository.findUserBySubject(profile.subject);

    if (!user) {
      try {
        user = await googleIdentityRepository.createUserWithIdentity(profile);
      } catch (error) {
        if (error instanceof ExistsError) throw error;
        throw error;
      }
    }

    const accessToken = tokenService.sign(user.id, "google");
    const refreshToken = refreshTokenService.generate();

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenService.hash(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      authProvider: "google",
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        authProvider: "google" as const,
      },
      accessToken,
      refreshToken,
    };
  },
};
