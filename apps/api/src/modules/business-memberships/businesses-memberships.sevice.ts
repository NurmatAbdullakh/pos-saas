import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
import { AuthService } from "../auth/auth.container.js"
import { passwordService } from "../auth/password.service.js"
import { businessMembershipsRepository } from "./businesses-memberships.repository.js"
import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"

export const businessMembershipsService = {
    async create(
        input:CreateBusinessMembershipInput, 
        businessId:id, 
    ){
        const passwordHash = await passwordService.hash(input.password)

        const userData = await AuthService.create({
            name: input.name,
            email: input.email,
            password:passwordHash
        })

        return await businessMembershipsRepository.create(businessId, userData.id, input.role )
    },
    
    async updateById (
        role: MemberRoles, 
        businessId: id,
        memberId: id,
    ){
        return await businessMembershipsRepository.updateById(
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