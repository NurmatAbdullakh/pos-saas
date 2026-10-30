import { pool } from "../../db/pool.js";
import { MemberRoles } from "../../shared/constants.js";
import { NotFoundError } from "../../shared/errors.js";
import { businessMembershipsRepositoryType } from "./businesses-memberships.type.js";

export const businessMembershipsRepository: businessMembershipsRepositoryType = {
    async create(input) {            
        const result = await  pool.query(`
            INSERT INTO business_memberships(business_id, user_id, role)
            VALUES($1, $2, $3)
            RETURNING business_id, user_id, role
        `, [input.business_id,  input.user_id, MemberRoles.owner])

        const row =  result.rows[0]

        if(!row) throw new NotFoundError("business membership is not created")

        return row
    },
    async getAll() {
        const result = await pool.query(`SELECT * FROM business_memberships`)

        return result.rows
    },
    async checkRoleAccess(business_id, user_id, role) {
        const result = await pool.query(`
            SELECT user_id 
            FROM business_memberships
            WHERE business_id = $1 AND role = $2 AND user_id=$3
        `, [business_id, role, user_id])

        const row = result.rows[0]

        if(!row) throw new NotFoundError("business_membership not found")

        return Boolean(row)

    },

}