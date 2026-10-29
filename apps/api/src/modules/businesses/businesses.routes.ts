import { Router } from "express";
import { createBusiness, deleteBusinessById, getAllBusiness, getBusinessById, updateBusinessById } from "./businesses.controller.js";

const router = Router();

router.post("/", createBusiness)
router.get("/", getAllBusiness)
router.get("/:id", getBusinessById)
router.delete("/:id", deleteBusinessById)
router.put("/:id", updateBusinessById)


export default router;