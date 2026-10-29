import { pool } from "../../db/pool.js";
import { NotFoundError } from "../../shared/errors.js";
import { businessesRepositoryType } from "./businesses.type.js";

export const businessesRepository: businessesRepositoryType = {
   async create(input) {
        const client = await pool.connect()

        try{
            await client.query(`BEGIN`)

            const createBusinessResult = await  client.query(`
                INSERT INTO businesses(name, created_by)
                VALUES($1, $2)
                RETURNING name, id
            `, [input.name, input.created_by])
            
            const createBusinessRow =  createBusinessResult.rows[0]

            if(!createBusinessRow) throw new NotFoundError("business is not created")

            const resultCreateBusinessMembership = await  client.query(`
                INSERT INTO business_memberships(business_id, user_id, role)
                VALUES($1, $2, $3)
                RETURNING business_id, user_id, role
            `, [createBusinessRow.id,  input.created_by, "owner"])

            const rowCreateBusinessMembership =  resultCreateBusinessMembership.rows[0]

            if(!rowCreateBusinessMembership) throw new NotFoundError("business membership is not created")

            await client.query(`COMMIT`)

            return   createBusinessRow
        }catch(error){
            await client.query(`ROLLBACK`)
            throw error;
        }finally{
            client.release()
        }
    },
    async getAll(created_by){
        const result = await pool.query(`
            SELECT id, name, created_by FROM businesses WHERE created_by=$1 ORDER BY created_at DESC
        `,[created_by])

        return result.rows
    },
    async deleteById(id, user_id){
        const result= await pool.query(
            `DELETE FROM businesses WHERE id=$1 AND created_by=$2 RETURNING id;`, [id, user_id]
        )

        const row = result.rows[0]

        if (!row) {
            throw new NotFoundError("business not found")
        }

        return row
    },
    async  getById(id,user_id) {        
        const result= await pool.query(
            `SELECT id, name, created_by FROM businesses WHERE id=$1 AND created_by=$2;`, [id, user_id]
        )

        const row = result.rows[0]

        if (!row) {
            throw new NotFoundError("business not found")
        }

        return row  
    },
    async  updateById(input,user_id) {
        const result= await pool.query(`
            UPDATE businesses 
            SET  name = $1
            WHERE id = $2 AND created_by=$3
            RETURNING id, name;
        `, [input.name, input.id, user_id])

        const row = result.rows[0]

        if (!row) {
            throw new NotFoundError("business not found")
        }

        return row
    }
}