import { Request, Response } from "express";
import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { MemberRoles } from "../../shared/constants.js";
import { NotAllowedError } from "../../shared/errors.js";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { idSchema } from "../../shared/schemas.js";
import { successResponse } from "../../shared/successResponse.js";
import { businessMembershipsService } from "../business-memberships/businesses-memberships.sevice.js";
import { createStoreSchema } from "./stores.schema.js";
import { storesService } from "./stores.service.js";

export const createStore=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, createStoreSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const result = await storesService.create({...body, business_id}, userId)

        res.status(201).json(successResponse(result, "Store successfully created"))
    }
)

export const getAllStore=asyncRequestHandler(
    async function (req:Request, res:Response){
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const result = await storesService.getAll(business_id, userId)

        res.status(200).json(successResponse(result, "Store successfully get all"))
    }
)

export const getStoreById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const storeId=parseOrThrow(req.params.store_id, idSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId
                
        const result = await storesService.getById(storeId, business_id, userId)

        res.status(200).json(successResponse(result, "Store successfully got by id"))
    }
)

export const deleteStoreById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const storeId=parseOrThrow(req.params.store_id, idSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId
        
        const result = await storesService.deleteById(storeId, business_id, userId)

        res.status(200).json(successResponse(result, "Store successfully deleted"))
    }
)

export const updateStoreById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, createStoreSchema)
        const storeId=parseOrThrow(req.params.store_id, idSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const hasAccess =
           await businessMembershipsService.checkRoleAccess(business_id, userId, MemberRoles.owner)

        if (!hasAccess) throw new NotAllowedError("not allowed");
                
        const result = await storesService.updateById({name:body.name, id: storeId}, business_id, userId)

        res.status(200).json(successResponse(result, "Store successfully updated"))
    }
)