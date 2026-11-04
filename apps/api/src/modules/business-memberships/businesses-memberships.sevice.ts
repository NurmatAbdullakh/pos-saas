import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
import { AuthService } from "../auth/auth.container.js"
import { businessMembershipsRepository } from "./businesses-memberships.repository.js"
import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"

export const businessMembershipsService = {
    async create(
        input:CreateBusinessMembershipInput, 
        businessId:id, 
    ){
        const userData = await AuthService.create(input)

        return await businessMembershipsRepository.create(businessId, userData.id, input.role )
    },
    
    async updateRoleById (
        role: MemberRoles, 
        businessId: id,
        memberId: id,
    ){
        return await businessMembershipsRepository.updateRoleById(
            businessId, 
            memberId,
            role
        )
    },

    async getAll(businessId:id){
        return await  businessMembershipsRepository.getAll(businessId)
    },
    async getById(businessId:id, memberId:id){
        return await businessMembershipsRepository.getById(businessId, memberId)
    },
    async deleteById(businessId:id, memberId:id){
        return await businessMembershipsRepository.deleteById(businessId, memberId)
    },
    async getUserRole(businessId:id, userId:id ){
        return await  businessMembershipsRepository.getUserRole(businessId, userId)
    }
}