import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { Request, Response } from "express";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { idSchema } from "../../shared/schemas.js";
import { successResponse } from "../../shared/successResponse.js";
import { storesService } from "./stores.service.js";
import { createStoreSchema } from "./stores.schema.js";
import { pool } from "../../db/pool.js";
import { MemberRoles } from "../../shared/constants.js";
import { NotAllowedError } from "../../shared/errors.js";

export const createStore=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, createStoreSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const findBusinessMembershipId = await pool.query(`
            SELECT user_id 
            FROM business_memberships
            WHERE business_id = $1 AND role = $2 AND user_id=$3
        `, [business_id, MemberRoles.owner, userId])

        const isCurrentUserBusiness =
        findBusinessMembershipId.rows.length > 0;

        if (!isCurrentUserBusiness) throw new NotAllowedError("not allowed");

        const result = await storesService.create({...body, business_id})

        res.status(201).json(successResponse(result, "Store successfully created"))
    }
)

export const getAllStore=asyncRequestHandler(
    async function (req:Request, res:Response){
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const findBusinessMembershipId = await pool.query(`
            SELECT user_id 
            FROM business_memberships
            WHERE business_id = $1 AND role = $2 AND user_id=$3
        `, [business_id, MemberRoles.owner, userId])

        const isCurrentUserBisness = findBusinessMembershipId.rows[0].user_id === userId
        
        if(!isCurrentUserBisness) throw new NotAllowedError("not allowed")

        const result = await storesService.getAll(business_id)

        res.status(200).json(successResponse(result, "Store successfully get all"))
    }
)

export const getStoreById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const storeId=parseOrThrow(req.params.store_id, idSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const findBusinessMembershipId = await pool.query(`
            SELECT user_id 
            FROM business_memberships
            WHERE business_id = $1 AND role = $2 AND user_id=$3
        `, [business_id, MemberRoles.owner, userId])

        const isCurrentUserBisness = findBusinessMembershipId.rows[0].user_id === userId
        
        if(!isCurrentUserBisness) throw new NotAllowedError("not allowed")
        
        const result = await storesService.getById(storeId, business_id)

        res.status(200).json(successResponse(result, "Store successfully got by id"))
    }
)

export const deleteStoreById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const storeId=parseOrThrow(req.params.store_id, idSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const findBusinessMembershipId = await pool.query(`
            SELECT user_id 
            FROM business_memberships
            WHERE business_id = $1 AND role = $2 AND user_id=$3
        `, [business_id, MemberRoles.owner, userId])

        const isCurrentUserBisness = findBusinessMembershipId.rows[0].user_id === userId
        
        if(!isCurrentUserBisness) throw new NotAllowedError("not allowed")
        
        const result = await storesService.deleteById(storeId, business_id)

        res.status(200).json(successResponse(result, "Store successfully deleted"))
    }
)

export const updateStoreById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, createStoreSchema)
        const storeId=parseOrThrow(req.params.store_id, idSchema)
        const business_id = parseOrThrow(req.params.business_id, idSchema)
        const userId = res.locals.userId

        const findBusinessMembershipId = await pool.query(`
            SELECT user_id 
            FROM business_memberships
            WHERE business_id = $1 AND role = $2 AND user_id=$3
        `, [business_id, MemberRoles.owner, userId])

        const isCurrentUserBisness = findBusinessMembershipId.rows[0].user_id === userId
        
        if(!isCurrentUserBisness) throw new NotAllowedError("not allowed")
        
        const result = await storesService.updateById({name:body.name, id: storeId}, business_id)

        res.status(200).json(successResponse(result, "Store successfully updated"))
    }
)