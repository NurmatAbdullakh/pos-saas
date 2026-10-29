import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"

export type businessMembershipsRepositoryType={
    create(input:Omit<CreateBusinessMembershipInput, "id" | "created_at">):Promise<{name:string, id:string}>
    getAll():Promise<{name:string, id:string}[]>
}
