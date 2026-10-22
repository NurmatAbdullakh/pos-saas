import { usersRepository } from "../users/users.repository.js";
import { createAuthService } from "./auth.service.js";

export const AuthService = createAuthService(usersRepository)