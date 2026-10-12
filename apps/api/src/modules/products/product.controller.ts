
import type { Request, Response } from "express";
import { createProductSchema } from "./product.schema.js";
import { productService } from "./product.container.js";


// CONTROLLER:
// Обрабатывает HTTP-запрос и формирует HTTP-ответ.
// Пока проверяем данные, но не сохраняем товар в БД.
export function createProduct(
  req: Request,
  res: Response,
): void {
  const result = createProductSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: result.error.issues,
    });
    return;
  }
  
  // Передаём проверенные данные в бизнес-логику.
  const product = productService.createProduct(result.data);

  res.status(200).json({
    message: "Product data is valid",
    data: product,
  });
}

export function getAllProducts(
    _req:Request,
    res:Response
){
    const allProducts = productService.getAllProducts()

    res.status(200).json({
        data: allProducts
    })
}