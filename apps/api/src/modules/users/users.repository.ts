import { pool } from "../../db/pool.js";
import { ExistsError } from "../../shared/errors.js";
import { User, UserRepository} from "./users.repository.interface.js";

export const usersRepository: UserRepository = {
    async create(input): Promise<Pick<User, "name" | "email" | "id">> {
        try {
          const result = await pool.query(
            `INSERT INTO users(name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING name, email, id;`,
            [input.name, input.email, input.password_hash]
          );
      
          return result.rows[0];
        } catch (error: any) {
          if (error.code === "23505") {
            throw new ExistsError("User with this email already exists");
          }
      
          throw error;
        }
      },
      
      async findUserByProperty(property:keyof User, value:string):Promise<User | null>{

        const result = await pool.query(`
          SELECT id, name, email, created_at, password_hash 
          FROM users 
          WHERE ${property}=$1
        `,[value])
        
        return result.rows[0] ?? null;
      }
}