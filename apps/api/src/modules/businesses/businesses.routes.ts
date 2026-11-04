import { Router } from "express";
import { createBusiness, deleteBusinessById, getAllBusiness, getBusinessById, updateBusinessById } from "./businesses.controller.js";
import { createStore, deleteStoreById, getAllStore, getStoreById, updateStoreById } from "../stores/stores.controller.js";
import { createBusinessMembership, deleteBusinessMembershipById, getAllBusinessMembership, getBusinessMembershipById, updateBusinessMembershipById } from "../business-memberships/businesses-memberships.controller.js";
import { requirePermission } from "../../middlewares/requirePermission.middleware.js";
import { Permissions } from "../../shared/constants.js";

const router = Router();

// businesses
router.post( "/",createBusiness)

router.get( "/", getAllBusiness)
router.get(
    "/:business_id",
    requirePermission(Permissions.BUSINESS_READ), 
    getBusinessById
)
router.delete(
    "/:business_id",
    requirePermission(Permissions.BUSINESS_MANAGE), 
    deleteBusinessById
)
router.put(
    "/:business_id",
    requirePermission(Permissions.BUSINESS_MANAGE), 
    updateBusinessById
)

// stores
router.post(
    "/:business_id/stores",
    requirePermission(Permissions.STORES_MANAGE), 
    createStore
    
)
router.get(
    "/:business_id/stores",
    requirePermission(Permissions.STORES_READ), 
    getAllStore
    
)
router.get(
    "/:business_id/stores/:store_id",
    requirePermission(Permissions.STORES_READ), 
    getStoreById
    
)
router.delete(
    "/:business_id/stores/:store_id",
    requirePermission(Permissions.STORES_MANAGE), 
    deleteStoreById
    
)
router.put(
    "/:business_id/stores/:store_id",
    requirePermission(Permissions.STORES_MANAGE), 
    updateStoreById
    
)

// members
router.post(
    "/:business_id/members", 
    requirePermission(Permissions.MEMBERS_MANAGE), 
    createBusinessMembership
)
router.get(
    "/:business_id/members", 
    requirePermission(Permissions.MEMBERS_READ),
    getAllBusinessMembership
)
router.get(
    "/:business_id/members/:member_id", 
    requirePermission(Permissions.MEMBERS_READ),
    getBusinessMembershipById
)

router.delete(
    "/:business_id/members/:member_id",
    requirePermission(Permissions.MEMBERS_MANAGE),
    deleteBusinessMembershipById
)

router.put(
    "/:business_id/members/:member_id", 
    requirePermission(Permissions.MEMBERS_MANAGE),
    updateBusinessMembershipById
)


export default router;