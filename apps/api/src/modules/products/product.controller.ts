
import type { Request, Response } from "express";
import { ValidationError } from "../../shared/errors.js";
import { productService } from "./product.container.js";
import { createProductSchema } from "./product.schema.js";
import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";

export const createProduct = asyncRequestHandler( 
   async function  (req: Request,res: Response,): Promise<void> {
    const validation = createProductSchema.safeParse(req.body);
    
    if (!validation.success) {
      throw new ValidationError()
    }
  
    const product = await productService.createProduct(validation.data);

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
    const id= req.params.id as string
    const result = await productService.findById(id)

    res.status(200).json({
      data:result
    }) 
})

export const updateProductById=asyncRequestHandler( 
  async function (req: Request, res: Response){
    const validation = createProductSchema.safeParse(req.body);

    if(!validation.success){
      throw new ValidationError()
    }
    
    const id = req.params.id as string
    const input = validation.data
    const result = await productService.updateById(id, input)

    res.status(200).json({
      message: `updated product by id: ${result.id}`,
      data: result
    })
})

export const  deleteProductById = asyncRequestHandler(
  async function (req:Request, res:Response) {
      const id = req.params.id as string

      await productService.deleteById(id)

      res.status(200).json({
        message: `deleted product by id : ${id}`
      })
  }
) 