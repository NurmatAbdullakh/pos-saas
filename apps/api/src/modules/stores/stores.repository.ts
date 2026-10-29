import { pool } from "../../db/pool.js";
import { NotFoundError } from "../../shared/errors.js";
import { type storesRepository as  storesRepositoryT} from "./stores.type.js";

export const storesRepository: storesRepositoryT = {
   async create(input) {
        const result = await pool.query(`
            INSERT INTO stores(name, business_id)
            VALUES ($1, $2)
            RETURNING name, id 
        `,[input.name, input.business_id])

        const row = result.rows[0]

        if(!row) throw new NotFoundError("store not found")
        
        return row
    },
    async getAll(business_id){
        const result = await pool.query(`
            SELECT id, name FROM stores WHERE business_id=$1 ORDER BY created_at DESC
        `,[business_id])

        return result.rows
    },
    async deleteById(id, business_id){
        const result= await pool.query(
            `DELETE FROM stores WHERE id=$1 AND business_id=$2 RETURNING id;`, [id, business_id]
        )

        const row = result.rows[0]

        if (!row) {
            throw new NotFoundError("store not found")
        }

        return row
    },
    async  getById(id, business_id) {        
        const result= await pool.query(
            `SELECT id, name FROM stores WHERE id=$1 AND business_id=$2;`, [id, business_id]
        )

        const row = result.rows[0]

        if (!row) {
            throw new NotFoundError("store not found")
        }

        return row  
    },
    async  updateById(input, business_id) {
        const result= await pool.query(`
            UPDATE stores 
            SET  name = $1
            WHERE id = $2 AND business_id=$3
            RETURNING id, name;
        `, [input.name, input.id, business_id])

        const row = result.rows[0]

        if (!row) {
            throw new NotFoundError("store not found")
        }

        return row
    }
}