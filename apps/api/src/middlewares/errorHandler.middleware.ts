import {Response, Request, NextFunction } from "express";
import { ErrorNames, getErrorStatus } from "../shared/errors.js";

export function erroHandlerMiddleware(err: Error, _req: Request,res: Response,next: NextFunction){
    if (res.headersSent) {
        return next(err);
    }

    const errorStatus = getErrorStatus(err.name as ErrorNames)

    res.status(errorStatus).json({
        message: err.message
    })
}
