import { pool } from "../../db/pool.js";
import { NotFoundError } from "../../shared/errors.js";
import { businessMembershipsRepositoryType } from "./businesses-memberships.type.js";

export const businessMembershipsRepository: businessMembershipsRepositoryType = {
    async create(businessId, userId, role) {         
        const result = await  pool.query(`
            INSERT INTO business_memberships(business_id, user_id, role)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [businessId, userId, role])

        const row =  result.rows[0]

        if(!row) throw new NotFoundError("business membership is not created")

        return row
    },

    async updateById(businessId, memberId, role){
        const userMemberRoleResult = await pool.query(`
            UPDATE business_memberships
            SET role = $1
            WHERE id = $2 AND business_id = $3
            RETURNING id
        `, [role, memberId, businessId])

        const row = userMemberRoleResult.rows[0]

        if(!row) throw new NotFoundError("member not updated")

        return row
    },

    async getAll(businessId) {
        const result = await pool.query(`
            SELECT 
                bm.id,
                u.id AS user_id,
                u.name,
                u.email,
                bm.role,
                bm.business_id
            FROM business_memberships bm
            JOIN users u ON u.id = bm.user_id
            WHERE bm.business_id = $1 
        `, [businessId])

        return result.rows
    },

    async getById(businessId, memberId) {
        const result = await pool.query(`
            SELECT 
                bm.id,
                u.id AS user_id,
                u.name,
                u.email,
                bm.role
            FROM business_memberships bm
            JOIN users u ON u.id = bm.user_id
            WHERE bm.business_id = $1 AND bm.id = $2
        `, [businessId, memberId])

        const row = result.rows[0]

        if(!row) throw new NotFoundError("member not found")

        return row
    },

    async deleteById (businessId, memberId){
        const result = await pool.query(`
            DELETE FROM business_memberships bm
            WHERE bm.business_id = $1 AND bm.id = $2
            RETURNING id
        `, [businessId, memberId])

        const row = result.rows[0]

        if(!row) throw new NotFoundError("member not found")

        return row
    },

    async getUserRole (businessId, userId){
        const result = await pool.query(`
            SELECT role 
            FROM business_memberships
            WHERE business_id = $1 AND user_id=$2
        `, [businessId, userId])

        return result.rows[0]?.role ?? null;
    }

}