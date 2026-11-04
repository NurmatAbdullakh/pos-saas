import { MemberRoles } from "../../shared/constants.js"
import { id } from "../../shared/types.js"
export interface MemberSummary  {
    id : id,
    user_id: id,
    name: string,
    email: string,
    role: MemberRoles
}

export interface MemberUpdateInput{
    name:string, 
    email:string, 
    password_hash:string,
    role: string
}

export type businessMembershipsRepositoryType={
    create(businessId:id, userId:id, role:MemberRoles):
        Promise<MemberSummary>

    getAll(businessId:id):Promise<Array<MemberSummary>>
    
    getById(businessId:id, member_id:id):Promise<MemberSummary>

    updateById(businessId: id, memberId:id, role:MemberRoles):Promise<MemberSummary>

    deleteById(businessId:id, member_id:id):Promise<{id:string}>

    checkRoleAccess(business_id:id, user_id:id,role: MemberRoles):
        Promise<boolean>
}
