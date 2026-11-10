import { facebookIdentityRepository } from "./facebook-identity.repository.js";
import { facebookTokenService } from "./facebook-token.service.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const facebookAuthService = {
  async login(accessToken: string) {
    const profile = await facebookTokenService.verify(accessToken);

    let user = await facebookIdentityRepository.findUserBySubject(profile.subject);

    if (!user) {
      user = await facebookIdentityRepository.createUserWithIdentity(profile);
    }

    const accessJwt = tokenService.sign(user.id, "facebook");
    const refreshToken = refreshTokenService.generate();

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenService.hash(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      authProvider: "facebook",
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        authProvider: "facebook" as const,
      },
      accessToken: accessJwt,
      refreshToken,
    };
  },
};
