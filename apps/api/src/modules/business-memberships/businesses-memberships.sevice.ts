import { businessMembershipsRepository } from "./businesses-memberships.repository.js"
import { CreateBusinessMembershipInput } from "./businesses-memberships.schema.js"

export const businessMembershipsService = {
    async create(input:Omit<CreateBusinessMembershipInput, "id" | "created_at">){
        return businessMembershipsRepository.create(input)
    },
}