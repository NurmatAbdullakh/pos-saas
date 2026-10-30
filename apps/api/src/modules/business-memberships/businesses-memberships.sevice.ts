import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
import { businessMembershipsRepository } from "./businesses-memberships.repository.js"
import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"

export const businessMembershipsService = {
    async create(input:Omit<CreateBusinessMembershipInput, "id" | "created_at">){
        return await businessMembershipsRepository.create(input)
    },
    async checkRoleAccess(business_id:id, user_id:id,role: MemberRoles.owner){
        return await  businessMembershipsRepository.checkRoleAccess(business_id, user_id, role)
    }
}