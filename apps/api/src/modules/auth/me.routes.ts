import { Router } from "express";
import { me } from "./auth.controller.js";

const router = Router();

router.get("/", me)

export default router;