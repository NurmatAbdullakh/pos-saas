import { pool } from "../../db/pool.js";
import { ExistsError } from "../../shared/errors.js";
import { UserRepository, User} from "./users.repository.interface.js";

export const usersRepository:Pick<UserRepository, "create"> = {
    async create(input): Promise<Pick<User, "name" | "email" | "id">> {
        try {
          const result = await pool.query(
            `INSERT INTO users(name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING name, email, id;`,
            [input.name, input.email, input.passwordHash]
          );
      
          return result.rows[0];
        } catch (error: any) {
          if (error.code === "23505") {
            throw new ExistsError("User with this email already exists");
          }
      
          throw error;
        }
      }
}