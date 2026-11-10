import { ExistsError, UnauthorizedError } from "../../shared/errors.js";
import { UserRepository } from "../users/users.repository.interface.js";
import { UserInput } from "../users/users.schema.js";
import { LoginInput } from "./auth.schema.js";
import { passwordService } from "./password.service.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";

export function createAuthService(repository: UserRepository) {
  return {
    async create(input: UserInput) {
      const isUserExistsByEmail = await repository.findUserByProperty("email", input.email);

      if (isUserExistsByEmail) {
        throw new ExistsError(`user exists with this email ${input.email}`);
      }

      const password_hash = await passwordService.hash(input.password);
      return await repository.create({ name: input.name, email: input.email, password_hash });
    },

    async login(input: LoginInput) {
      const user = await repository.findUserByProperty("email", input.email);

      if (!user?.password_hash) {
        throw new UnauthorizedError("Invalid email or password");
      }

      const isPasswordVerified = await passwordService.verify(user.password_hash, input.password);

      if (!isPasswordVerified) {
        throw new UnauthorizedError("Invalid email or password");
      }

      const accessToken = tokenService.sign(user.id, "password");
      const refreshToken = refreshTokenService.generate();

      await refreshTokenRepository.create({
        userId: user.id,
        tokenHash: refreshTokenService.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        authProvider: "password",
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          authProvider: "password" as const,
        },
        accessToken,
        refreshToken,
      };
    },
  };
}
