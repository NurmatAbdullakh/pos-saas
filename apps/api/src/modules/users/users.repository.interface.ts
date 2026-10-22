
import { id } from "../../shared/types.js";
import { UserInput } from "./users.schema.js";

export type User = Omit<UserInput, "password"> & { passwordHash: string;} &  { id: id }

export interface UserRepository {
  create(input:  Omit<UserInput, "password"> & { passwordHash: string;} ): Promise<Pick<User, "name" | "email" | "id">>,
  findUserByEmail(email:string):Promise<id | null>
}