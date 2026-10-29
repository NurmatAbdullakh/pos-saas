import { Router } from "express";
import { createBusiness, deleteBusinessById, getAllBusiness, getBusinessById, updateBusinessById } from "./businesses.controller.js";
import { createStore, deleteStoreById, getAllStore, getStoreById, updateStoreById } from "../stores/stores.controller.js";

const router = Router();

router.post("/", createBusiness)
router.get("/", getAllBusiness)
router.get("/:id", getBusinessById)
router.delete("/:id", deleteBusinessById)
router.put("/:id", updateBusinessById)


router.post("/:business_id/stores", createStore)
router.get("/:business_id/stores", getAllStore)
router.get("/:business_id/stores/:store_id", getStoreById)
router.delete("/:business_id/stores/:store_id", deleteStoreById)
router.put("/:business_id/stores/:store_id", updateStoreById)


export default router;