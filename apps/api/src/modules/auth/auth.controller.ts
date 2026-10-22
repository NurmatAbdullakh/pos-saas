import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { userSchema } from "../users/users.schema.js";
import { AuthService } from "./auth.container.js";
import {Request, Response} from  "express"

export const register = asyncRequestHandler(
    async function (req:Request, res:Response){
        const body= parseOrThrow(req.body, userSchema)

        const userCreateresult = await AuthService.create(body)

       res.status(201).json({data:userCreateresult})
    }
)