import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"

export type businessMembershipsRepositoryType={
    create(input:Omit<CreateBusinessMembershipInput, "id" | "created_at">):
        Promise<{name:string, id:string, role: MemberRoles}>

    getAll():Promise<{name:string, id:string}[]>
    
    checkRoleAccess(business_id:id, user_id:id,role: MemberRoles.owner):
        Promise<boolean>
}
