import { Router } from "express";
import {
  login, register, refresh, logout, googleLogin, facebookLogin, appleLogin,
  requestPhoneOtp, verifyPhoneOtp,
} from "./auth.controller.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);
router.post("/apple", appleLogin);
router.post("/phone/request-otp", requestPhoneOtp);
router.post("/phone/verify-otp", verifyPhoneOtp);
router.post("/refresh", refresh);
router.post("/logout", logout);
export default router;
