import { Router } from "express";
import { createProduct, deleteProductById, getAllProducts, getProductByID, updateProductById } from "./product.controller.js";

const router = Router();

router.get("/", getAllProducts)
router.post("/", createProduct);
router.get("/:id", getProductByID)
router.put("/:id", updateProductById)
router.delete("/:id", deleteProductById)

export default router;