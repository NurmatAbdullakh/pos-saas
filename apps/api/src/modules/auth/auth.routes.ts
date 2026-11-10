import { Router } from "express";
import {
  login,
  register,
  refresh,
  logout,
  googleLogin,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
