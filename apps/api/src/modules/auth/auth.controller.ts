import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { userSchema } from "../users/users.schema.js";
import { AuthService } from "./auth.container.js";
import { Request, Response } from "express";
import { loginSchema } from "./auth.schema.js";
import { googleAuthSchema } from "./google-auth.schema.js";
import { googleAuthService } from "./google-auth.service.js";
import { facebookAuthSchema } from "./facebook-auth.schema.js";
import { facebookAuthService } from "./facebook-auth.service.js";
import { appleAuthSchema } from "./apple-auth.schema.js";
import { appleAuthService } from "./apple-auth.service.js";
import { idSchema } from "../../shared/schemas.js";
import { NotFoundError, UnauthorizedError } from "../../shared/errors.js";
import { usersRepository } from "../users/users.repository.js";
import { refreshSessionService } from "./refreshSession.service.js";
import { env } from "node:process";
import { refreshTokenRepository } from "./refresh-token.repository.js";
import { refreshTokenService } from "./refresh-token.service.js";
import { successResponse } from "../../shared/successResponse.js";
import { phoneAuthService } from "./phone-auth.service.js";
import { requestPhoneOtpSchema, verifyPhoneOtpSchema } from "./phone-auth.schema.js";

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax",
    path: "/api/auth", maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, userSchema);
  const userCreateResult = await AuthService.create(body);
  res.status(201).json(successResponse(userCreateResult, "register successfully"));
});

export const login = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, loginSchema);
  const result = await AuthService.login(body);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...response } = result;
  res.status(200).json(successResponse(response, "login successfully"));
});

export const googleLogin = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, googleAuthSchema);
  const result = await googleAuthService.login(body.idToken);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...response } = result;
  res.status(200).json(successResponse(response, "Google login successfully"));
});

export const facebookLogin = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, facebookAuthSchema);
  const result = await facebookAuthService.login(body.accessToken);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...response } = result;
  res.status(200).json(successResponse(response, "Facebook login successfully"));
});

export const appleLogin = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, appleAuthSchema);
  const result = await appleAuthService.login(body);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...response } = result;
  res.status(200).json(successResponse(response, "Apple login successfully"));
});

export const requestPhoneOtp = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, requestPhoneOtpSchema);
  const result = await phoneAuthService.requestOtp(body.phoneNumber);
  res.status(200).json(successResponse(result, "Phone verification started"));
});

export const verifyPhoneOtp = asyncRequestHandler(async function (req: Request, res: Response) {
  const body = parseOrThrow(req.body, verifyPhoneOtpSchema);
  const result = await phoneAuthService.verifyOtp(body);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken: _, ...response } = result;
  res.status(200).json(successResponse(response, "Phone authentication successful"));
});

export const telegramWebhook = asyncRequestHandler(async function (req: Request, res: Response) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.header("x-telegram-bot-api-secret-token") !== secret) {
    throw new UnauthorizedError("Invalid Telegram webhook secret");
  }
  await phoneAuthService.handleTelegramUpdate(req.body);
  res.status(200).json({ ok: true });
});

export const refresh = asyncRequestHandler(async function (req: Request, res: Response) {
  const rawToken: unknown = req.cookies?.refreshToken;
  if (typeof rawToken !== "string" || !rawToken) throw new UnauthorizedError("Refresh token is required");
  const result = await refreshSessionService.refresh(rawToken);
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken, authProvider: result.authProvider });
});

export const logout = asyncRequestHandler(async function (req: Request, res: Response) {
  const rawToken: unknown = req.cookies?.refreshToken;
  if (typeof rawToken === "string" && rawToken) {
    await refreshTokenRepository.revoke(refreshTokenService.hash(rawToken));
  }
  res.clearCookie("refreshToken", {
    httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth",
  });
  res.status(200).json(successResponse({}, "logged out"));
});

export const me = asyncRequestHandler(async function (_: Request, res: Response) {
  const userId = parseOrThrow(res.locals.userId, idSchema);
  const result = await usersRepository.findUserByProperty("id", userId);
  if (!result) throw new NotFoundError("user not found");
  const authProvider =
    res.locals.authProvider === "google" || res.locals.authProvider === "facebook" ||
    res.locals.authProvider === "apple" ? res.locals.authProvider : "password";
  res.status(200).json(successResponse({
    id: result.id, name: result.name, email: result.email,
    created_at: result.created_at, authProvider,
  }, "user data reached successfully"));
});
