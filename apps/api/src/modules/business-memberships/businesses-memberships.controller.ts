import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { Request, Response } from "express";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { businessMembershipSchema  } from "./businesses-memberships.schema.js";
import { businessMembershipsService } from "./businesses-memberships.sevice.js";

export const createBusinessMembership=asyncRequestHandler(
    async function (req:Request, res:Response){
        const body=parseOrThrow(req.body, businessMembershipSchema)

        const result = await businessMembershipsService.create(body)

        res.status(201).json(result)
    }
)