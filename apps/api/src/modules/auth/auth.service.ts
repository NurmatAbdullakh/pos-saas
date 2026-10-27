import { ExistsError, UnauthorizedError } from "../../shared/errors.js";
import { UserRepository } from "../users/users.repository.interface.js";
import { UserInput } from "../users/users.schema.js";
import { LoginInput } from "./auth.schema.js";
import { passwordService } from "./password.service.js";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { tokenService } from "./token.service.js";

export function createAuthService( repository: UserRepository ){
    return {
        async create(input:UserInput){
            const isUserExistsByEmail = await repository.findUserByProperty("email",input.email)

            if(isUserExistsByEmail){
                throw new ExistsError("user exists with this email");
            }

            const password_hash = await passwordService.hash(input.password)
            
            return  await repository.create({name:input.name, email:input.email, password_hash})
        },
        async login(input: LoginInput) {
            const foundUserByEmail = await repository.findUserByProperty(
              "email",
              input.email,
            );
          
            if (!foundUserByEmail) {
              throw new UnauthorizedError("Invalid email or password");
            }
          
            const isPasswordVerified = await passwordService.verify(
              foundUserByEmail.password_hash,
              input.password,
            );
          
            if (!isPasswordVerified) {
              throw new UnauthorizedError("Invalid email or password");
            }
          
            const accessToken = tokenService.sign(foundUserByEmail.id);
          
            const refreshToken = refreshTokenService.generate();
            const refreshTokenHash = refreshTokenService.hash(refreshToken);
          
            const refreshTokenExpiresAt = new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            );
          
            await refreshTokenRepository.create({
              userId:foundUserByEmail.id,
              tokenHash: refreshTokenHash,
              expiresAt: refreshTokenExpiresAt,
            });
          
            return {
              user: {
                id: foundUserByEmail.id,
                name: foundUserByEmail.name,
                email: foundUserByEmail.email,
                created_at: foundUserByEmail.created_at,
              },
              accessToken,
              refreshToken,
            };
        },
    }
}