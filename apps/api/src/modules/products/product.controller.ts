
import type { Request, Response } from "express";
import { createProductSchema } from "./product.schema.js";
import { productService } from "./product.container.js";


// CONTROLLER:
// Обрабатывает HTTP-запрос и формирует HTTP-ответ.
// Пока проверяем данные, но не сохраняем товар в БД.
export async function  createProduct(
  req: Request,
  res: Response,
): Promise<void> {
    const validation = createProductSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        details: validation.error.issues,
    });
    
    return;
  }
  
  const product = await productService.createProduct(validation.data);

  res.status(201).json({
    message: "Product data is valid",
    data: product,
  });
}

export async function getAllProducts(
    _req:Request,
    res:Response
){
    const allProducts = await productService.getAllProducts()

    res.status(200).json({
        data: allProducts
    })
}

export async function getProductByID(req:Request, res:Response){
  const id= req.params.id as string
  
  try{
    const result = await productService.findById(id)

    res.status(200).json({
      data:result
    }) 
  }catch(error:unknown){
  
    if(error instanceof Error && error.message === "PRODUCT_NOT_FOUND" ){
      res.status(404).json({
        message: error.message
      })
      return
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
} 

export async function updateProductById(req: Request, res: Response){
    const validation = createProductSchema.safeParse(req.body);
    if(!validation.success ){
      res.status(400).json({
        error: "VALIDATION_ERROR",
        details: validation.error.issues,
      });
      return;
    }
    
    const id = req.params.id as string
    const  input = validation.data

    try {
      const result = await productService.updateById(id, input)

      res.status(200).json({
        message: `updated product by id: ${result.id}`,
        data: result
      })
    } catch (error:unknown) {
  
      if(error instanceof Error && error.message === "PRODUCT_NOT_FOUND" ){
        res.status(404).json({
          message: error.message
        })
        return
      }
  
      res.status(500).json({
        message: "Internal server error",
      });
    }
}

export async function deleteProductById( req:Request, res:Response ) {
  const id = req.params.id as string

  try {
    await productService.deleteById(id)

    res.status(200).json({
      message: `deleted product by id : ${id}`
    })
  } catch (error:unknown) {

    if(error instanceof Error && error.message === "PRODUCT_NOT_FOUND" ){
      res.status(404).json({
        message: error.message
      })
      return
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}