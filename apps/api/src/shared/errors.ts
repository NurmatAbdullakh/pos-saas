import z from "zod";

export enum errorStatuses {
    OK = 200,
    BadRequеst=400,
    NotFound=404,
    ServerError=500
}

export enum ErrorNames {
    ProductNotFoundError="ProductNotFoundError",
    ValidationFailed="ValidationFailed"
}

export const getErrorStatus=(ErrorName:ErrorNames):errorStatuses=>{
    switch(ErrorName){
        case ErrorNames.ProductNotFoundError :  return errorStatuses.NotFound
        case ErrorNames.ValidationFailed: return errorStatuses.BadRequеst
        default: return errorStatuses.ServerError
    }
} 

export class ProductNotFoundError extends Error{
    constructor() {
        super("Product not found");
        this.name = "ProductNotFoundError";
    }
}

type ValidationDetails = z.ZodError["issues"];
export class ValidationError extends Error{
    constructor(public details: ValidationDetails){
        super("Validation failed")
        this.name="ValidationFailed"
        this.details=details
    }
}