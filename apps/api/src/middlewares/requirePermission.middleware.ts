import { NextFunction, Request, Response } from "express"
import { businessMembershipsService } from "../modules/business-memberships/businesses-memberships.sevice.js"
import { parseOrThrow } from "../shared/parseOrThrow.js"
import { idSchema } from "../shared/schemas.js"
import { hasPermission } from "../shared/hasPermission.js"
import { NotAllowedError } from "../shared/errors.js"
import { Permissions } from "../shared/constants.js"

export function requirePermission(permission: Permissions) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            const businessId = parseOrThrow(req.params.business_id, idSchema)
            const userId =  parseOrThrow(res.locals.userId, idSchema) 
        
            const userRole = await businessMembershipsService.getUserRole(businessId, userId)
    
            if (!userRole) {
                throw new NotAllowedError("User is not a member of this business")
            }
        
            if (!hasPermission(userRole, permission)) {
                throw new NotAllowedError("Insufficient permissions")
            }
    
            next()
            
        } catch (error) {
            next(error)
        }
    }
}