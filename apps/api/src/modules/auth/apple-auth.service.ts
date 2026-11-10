import { ExistsError } from "../../shared/errors.js";
import { appleIdentityRepository } from "./apple-identity.repository.js";
import { appleTokenService } from "./apple-token.service.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const appleAuthService = {
  async login(input: {
    code: string;
    nonce: string;
    
    firstName?: string;
    lastName?: string;
  }) {
    const profile = await appleTokenService.exchangeAndVerify(input);
    let user = await appleIdentityRepository.findUserBySubject(profile.subject);

    if (!user) {
      try {
        user = await appleIdentityRepository.createUserWithIdentity(profile);
      } catch (error) {
        if (error instanceof ExistsError) throw error;
        throw error;
      }
    }

    const accessToken = tokenService.sign(user.id, "apple");
    const refreshToken = refreshTokenService.generate();

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenService.hash(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      authProvider: "apple",
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        authProvider: "apple" as const,
      },
      accessToken,
      refreshToken,
    };
  },
};
