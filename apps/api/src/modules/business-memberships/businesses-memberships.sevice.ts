import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
import { AuthService } from "../auth/auth.container.js"
import { passwordService } from "../auth/password.service.js"
import { businessMembershipsRepository } from "./businesses-memberships.repository.js"
import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"
import { MemberUpdateInput } from "./businesses-memberships.type.js"
import { requireOwner } from "./businesses-memberships.utils.js"

export const businessMembershipsService = {
    async create(
        input:CreateBusinessMembershipInput, 
        businessId:id, 
        userId:id
    ){
        await requireOwner(businessId, userId)
        
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
        userId:id
    ){
        await requireOwner(businessId, userId)
        
        return await businessMembershipsRepository.updateById(
            businessId, 
            memberId,
            role
        )

    },

    async getAll(businessId:id, userId : id){
        await requireOwner(businessId, userId)

        return await  businessMembershipsRepository.getAll(businessId)
    },
    async getById(businessId:id, memberId:id, userId:string){
        await requireOwner(businessId, userId)

        return await businessMembershipsRepository.getById(businessId, memberId)
    },
    async deleteById(businessId:id, memberId:id, userId:string){
        await requireOwner(businessId, userId)

        return await businessMembershipsRepository.deleteById(businessId, memberId)
    },
    async checkRoleAccess(businessId:id, user_id:id, role: MemberRoles, userId:string ){
        await requireOwner(businessId, userId)

        return await  businessMembershipsRepository.checkRoleAccess(businessId, user_id, role)
    }
}