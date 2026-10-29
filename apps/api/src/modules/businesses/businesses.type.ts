import { id } from "../../shared/types.js"
import { CreateBusinessInput } from "./businesses.schema.js"

export type businessesRepositoryType={
    create(input:CreateBusinessInput & {created_by:string}):Promise<{name:string, id:id}>
    getAll(created_by:string):Promise<{name:string, id:id}[]>
    deleteById(id:id):Promise<{id:id}>,
    getById(id:id):Promise<id>,
    updateById(input:CreateBusinessInput & {id:string}):Promise<{name:string, id:id}[]>
}
