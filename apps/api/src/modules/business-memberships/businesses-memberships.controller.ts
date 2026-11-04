import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { Request, Response } from "express";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { businessMembershipsService } from "./businesses-memberships.sevice.js";
import { idSchema } from "../../shared/schemas.js";
import { businessMembershipCreateBodySchema } from "./businesses-memberships.schema.js";
import z from "zod";
import { MemberRoles } from "../../shared/constants.js";

export const createBusinessMembership=asyncRequestHandler(
    async function (req:Request, res:Response){
        const businessId = parseOrThrow(req.params.business_id, idSchema)
        const userId = parseOrThrow(res.locals.userId, idSchema)
        const body = parseOrThrow(req.body, businessMembershipCreateBodySchema)

        const result = await businessMembershipsService.create(
            {
                password: body.password,
                role: body.role, 
                name: body.name,
                email: body.email
            },
            businessId,
            userId
        )

        res.status(200).json(result)
    }
)

export const getAllBusinessMembership=asyncRequestHandler(
    async function (req:Request, res:Response){
        const businessId = parseOrThrow(req.params.business_id, idSchema)
        const userId = parseOrThrow(res.locals.userId, idSchema)

        const result = await businessMembershipsService.getAll(businessId, userId)

        res.status(200).json(result)
    }
)

export const getBusinessMembershipById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const businessId = parseOrThrow(req.params.business_id, idSchema)
        const memberId = parseOrThrow(req.params.member_id, idSchema)
        const userId = parseOrThrow(res.locals.userId, idSchema)

        const result = await businessMembershipsService.getById(businessId, memberId, userId)

        res.status(200).json(result)
    }
)

export const deleteBusinessMembershipById=asyncRequestHandler(
    async function (req:Request, res:Response){
        const businessId = parseOrThrow(req.params.business_id, idSchema)
        const memberId = parseOrThrow(req.params.member_id, idSchema)
        const userId = parseOrThrow(res.locals.userId, idSchema)

        const result = await businessMembershipsService.deleteById(businessId, memberId, userId)

        res.status(200).json(result)
    }
)


export const updateBusinessMembershipById = asyncRequestHandler(
    async function (req:Request, res:Response){
        const businessId = parseOrThrow(req.params.business_id, idSchema)
        const memberId = parseOrThrow(req.params.member_id, idSchema)
        const userId = parseOrThrow(res.locals.userId, idSchema)
        const body = parseOrThrow(
            req.body,
            z.object({
                role: z.enum([MemberRoles.owner, MemberRoles.manager, MemberRoles.cashier]),
            })
        )


        const result = await businessMembershipsService.updateById(body.role, businessId, memberId, userId)

        res.status(200).json(result)
    }
) 

