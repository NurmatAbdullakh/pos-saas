import { Router } from "express";
import { createProduct, getAllProducts } from "./product.controller.js";

// ROUTER: определяет, какой обработчик вызывается
// для конкретного HTTP-метода и пути.
const router = Router();

router.get("/", getAllProducts)
router.post("/", createProduct);


export default router;