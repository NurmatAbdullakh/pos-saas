import { Router } from "express";
import { createBusinessMembership } from "./businesses-memberships.controller.js";

const router = Router();

router.post("/", createBusinessMembership)

export default router;