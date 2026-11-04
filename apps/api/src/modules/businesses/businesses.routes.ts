import { Router } from "express";
import { createBusiness, deleteBusinessById, getAllBusiness, getBusinessById, updateBusinessById } from "./businesses.controller.js";
import { createStore, deleteStoreById, getAllStore, getStoreById, updateStoreById } from "../stores/stores.controller.js";
import { createBusinessMembership, deleteBusinessMembershipById, getAllBusinessMembership, getBusinessMembershipById, updateBusinessMembershipById } from "../business-memberships/businesses-memberships.controller.js";

const router = Router();

// businesses
router.post("/", createBusiness)
router.get("/", getAllBusiness)
router.get("/:id", getBusinessById)
router.delete("/:id", deleteBusinessById)
router.put("/:id", updateBusinessById)

// stores
router.post("/:business_id/stores", createStore)
router.get("/:business_id/stores", getAllStore)
router.get("/:business_id/stores/:store_id", getStoreById)
router.delete("/:business_id/stores/:store_id", deleteStoreById)
router.put("/:business_id/stores/:store_id", updateStoreById)

// members
router.post("/:business_id/members", createBusinessMembership)
router.get("/:business_id/members", getAllBusinessMembership)
router.get("/:business_id/members/:member_id", getBusinessMembershipById)
router.delete("/:business_id/members/:member_id", deleteBusinessMembershipById)
router.put("/:business_id/members/:member_id", updateBusinessMembershipById)


export default router;