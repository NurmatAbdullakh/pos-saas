import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
export interface MemberSummary  {
    id : id,
    user_id: id,
    name: string,
    email: string,
    role: MemberRoles
}

export type businessMembershipsRepositoryType={
    create(businessId:id, userId:id, role:MemberRoles):
        Promise<{id: id}>

    getAll(businessId:id):Promise<Array<MemberSummary>>
    
    getById(businessId:id, member_id:id):Promise<MemberSummary>

    updateRoleById(businessId: id, memberId:id, role:MemberRoles):Promise<{id: id}>

    deleteById(businessId:id, member_id:id):Promise<{id: id}>

    getUserRole (businessId:id, userId:id):Promise<MemberRoles | null>
}
