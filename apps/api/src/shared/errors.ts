import z from "zod";

export enum errorStatuses {
    OK = 200,
    BadRequеst=400,
    Unauthorized=401,
    NotAllowed=403,
    NotFound=404,
    Conflict=409,
    ServerError=500,
}

export enum ErrorNames {
    ValidationFailed="ValidationFailed",
    NotFoundError="NotFoundError",
    ExistsError="ExistsError",
    Unauthorized="Unauthorized",
    NotAllowed="NotAllowed"
}

export const getErrorStatus=(ErrorName:ErrorNames):errorStatuses=>{
    switch(ErrorName){
        case ErrorNames.NotFoundError :  return errorStatuses.NotFound
        case ErrorNames.ValidationFailed: return errorStatuses.BadRequеst
        case ErrorNames.ExistsError: return errorStatuses.Conflict
        case ErrorNames.Unauthorized: return errorStatuses.Unauthorized
        case ErrorNames.NotAllowed: return errorStatuses.NotAllowed
        default: return errorStatuses.ServerError
    }
} 
export class NotFoundError extends Error{
    constructor(message:string){
        super(message)
        this.name = ErrorNames.NotFoundError
    }
}

type ValidationDetails = z.ZodError["issues"];
export class ValidationError extends Error{
    constructor(public details: ValidationDetails){
        super("Validation failed")
        this.name=ErrorNames.ValidationFailed
        this.details=details
    }
}

export class ExistsError extends Error{
    constructor(message:string){
        super(message);
        this.name = ErrorNames.ExistsError
    }
}

export class UnauthorizedError extends Error{
    constructor(message:string){
        super(message);
        this.name = ErrorNames.Unauthorized
    }
}

export class NotAllowedError extends Error{
    constructor(message:string){
        super(message);
        this.name = ErrorNames.NotAllowed
    }
}