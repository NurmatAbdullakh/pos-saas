
import type { Request, Response } from "express";
import { productService } from "./product.container.js";
import { createProductSchema } from "./product.schema.js";
import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { idSchema } from "../../shared/schemas.js";
import { parseOrThrow } from "../../shared/validate.js";

export const createProduct = asyncRequestHandler( 
   async function  (req: Request,res: Response,): Promise<void> {

    const validatedData = parseOrThrow(req.body, createProductSchema)

    const product = await productService.createProduct(validatedData);

    res.status(201).json({
      message: "Product data is valid",
      data: product,
    });
})

export const  getAllProducts = asyncRequestHandler(
  async function ( _req:Request, res:Response){
  const allProducts = await productService.getAllProducts()

  res.status(200).json({
      data: allProducts
  })
})

export const getProductByID =asyncRequestHandler(
  async function (req:Request, res:Response){
    const id = parseOrThrow(req.params.id, idSchema)
    const result = await productService.findById(id)

    res.status(200).json({
      data:result
    }) 
})

export const updateProductById=asyncRequestHandler( 
  async function (req: Request, res: Response){

    
    const id = parseOrThrow(req.params.id, idSchema)
    const input = parseOrThrow(req.body, createProductSchema)

    const result = await productService.updateById(id, input)

    res.status(200).json({
      message: `updated product by id: ${result.id}`,
      data: result
    })
})

export const  deleteProductById = asyncRequestHandler(
  async function (req:Request, res:Response) {      
      const id = parseOrThrow(req.params.id, idSchema)
      
      await productService.deleteById(id)

      res.status(200).json({
        message: `deleted product by id : ${id}`
      })
  }
) 