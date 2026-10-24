import { asyncRequestHandler } from "../../shared/asyncRequestHandler.js";
import { parseOrThrow } from "../../shared/parseOrThrow.js";
import { userSchema } from "../users/users.schema.js";
import { AuthService } from "./auth.container.js";
import {Request, Response} from  "express"
import { loginSchema } from "./auth.schema.js";
import { idSchema } from "../../shared/schemas.js";
import { NotFoundError } from "../../shared/errors.js";
import { usersRepository } from "../users/users.repository.js";

export const register = asyncRequestHandler(
    async function (req:Request, res:Response){
        const body= parseOrThrow(req.body, userSchema)

        const userCreateresult = await AuthService.create(body)

       res.status(201).json({data:userCreateresult})
    }
)

export const login=asyncRequestHandler(
    async function (req:Request, res:Response){     
        
        const body = parseOrThrow(req.body, loginSchema)
                
        const result = await AuthService.login(body)

        res.status(200).json(result)
    }
)

export const me= asyncRequestHandler(
    async function (_:Request, res:Response) {
        const userId = parseOrThrow(res.locals.userId, idSchema)

        const result = await usersRepository.findUserByProperty('id', userId)        
        
        if(!result) throw new NotFoundError("user not found ") 
        
        res.status(200).json({
            id:result.id,
            name:result.name,
            email: result.email,
            created_at: result.created_at
        })
    }
)