import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { Request, Response } from "express";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { createBusinessSchema } from "./businesses.schema.js";
import { businessesService } from "./businesses.sevice.js";
import { idSchema } from "../../shared/schemas.js";

export const createBusiness=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, createBusinessSchema)
        const userId = res.locals.userId

        const result = await businessesService.create({...body, userId})

        res.status(201).json(result)
    }
)

export const getAllBusiness=asyncRequestHandler(
    async function (_req:Request, res:Response){
        const userId = res.locals.userId
        
        const result = await businessesService.getAll(userId)

        res.status(201).json(result)
    }
)

export const getBusinessById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const id=parseOrThrow(req.params.id, idSchema)
        
        const result = await businessesService.getById(id)

        res.status(200).json(result)
    }
)

export const deleteBusinessById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const id=parseOrThrow(req.params.id, idSchema)
        
        const result = await businessesService.deleteById(id)

        res.status(200).json(result)
    }
)

export const updateBusinessById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, createBusinessSchema)
        const id=parseOrThrow(req.params.id, idSchema)
        
        const result = await businessesService.updateById({
            name:body.name,
            id
        })

        res.status(200).json(result)
    }
)