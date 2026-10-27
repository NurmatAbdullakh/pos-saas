import { NextFunction, Request, Response } from "express";
import { tokenService } from "../modules/auth/token.service.js";
import { UnauthorizedError } from "../shared/errors.js";
import { asyncRequestHandler } from "../shared/asyncRequestHandler.js";
 
export const  authTokenMiddleware = asyncRequestHandler(
    async function (req:Request, res: Response, next: NextFunction){
        const authorization = req.headers.authorization
        
        if(!authorization) {
            throw new UnauthorizedError("Authentication required")
        }

        const [schema, token]= authorization.split(" ")

        if(schema !== "Bearer" || !token){
            throw new UnauthorizedError("Invalid authorization format")
        }

        try {
            const payload = await tokenService.verify(token);
            res.locals.userId = payload.userId
        } catch {
            throw new UnauthorizedError("Invalid or expired token");
        }

        next()
})