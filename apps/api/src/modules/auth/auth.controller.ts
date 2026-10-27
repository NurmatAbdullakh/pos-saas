import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { userSchema } from "../users/users.schema.js";
import { AuthService } from "./auth.container.js";
import {Request, Response} from  "express"
import { loginSchema } from "./auth.schema.js";
import { idSchema } from "../../shared/schemas.js";
import { NotFoundError, UnauthorizedError } from "../../shared/errors.js";
import { usersRepository } from "../users/users.repository.js";
import { refreshSessionService } from "./refreshSession.service.js";
import { env } from "node:process";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";

export const register = asyncRequestHandler(
    async function (req:Request, res:Response){
        const body= parseOrThrow(req.body, userSchema)

        const userCreateresult = await AuthService.create(body)

       res.status(201).json({data:userCreateresult})
    }
)

export const login = asyncRequestHandler(
    async function (req: Request, res: Response) {
      const body = parseOrThrow(req.body, loginSchema);
      const result = await AuthService.login(body);
  
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      const { refreshToken: _, ...response } = result;
  
      res.status(200).json(response);
    },
);

export const refresh = asyncRequestHandler(
    async function (req: Request, res: Response) {
        const rawToken: unknown = req.cookies?.refreshToken;

        if (typeof rawToken !== "string" || !rawToken) {
        throw new UnauthorizedError("Refresh token is required");
        }

        const result = await refreshSessionService.refresh(rawToken);

        res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
        accessToken: result.accessToken,
        });
    },
);

export const logout = asyncRequestHandler(
    async function (req:Request, res:Response){
        const rawToken: unknown = req.cookies?.refreshToken;

        if (typeof rawToken !== "string" || !rawToken) {
            throw new UnauthorizedError("Refresh token is required");
        }

        const refreshTokenHash = refreshTokenService.hash(rawToken);

        await refreshTokenRepository.revoke(refreshTokenHash)

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth",
        });

        res.status(200).json({message:"logged out"})
    }
)

export const me= asyncRequestHandler(
    async function (_:Request, res:Response) {
        const userId = parseOrThrow(res.locals.userId, idSchema)

        const result = await usersRepository.findUserByProperty('id', userId)        
        
        if(!result) throw new NotFoundError("user not found ") 
        
        res.status(200).json({
            id:result.id,
            name:result.name,
            email: result.email,
            created_at: result.created_at
        })
    }
)