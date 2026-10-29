import { pool } from "../../db/pool.js";
import { NotFoundError } from "../../shared/errors.js";
import { businessMembershipsRepositoryType } from "./businesses-memberships.type.js";

export const businessMembershipsRepository: businessMembershipsRepositoryType = {
    async create(input) {
        console.log(input);
        
            
        const result = await  pool.query(`
            INSERT INTO business_memberships(business_id, user_id, role)
            VALUES($1, $2, $3)
            RETURNING business_id, user_id, role
        `, [input.business_id,  input.user_id, "owner"])

        const row =  result.rows[0]

        if(!row) throw new NotFoundError("business membership is not created")

        return row
    },
    async getAll() {
        const result = await pool.query(`SELECT * FROM business_memberships`)

        const row = result.rows[0]

        if(!row) throw new NotFoundError("business_membership not found")

        return row

    },

}