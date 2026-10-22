import { ExistsError } from "../../shared/errors.js";
import { UserRepository } from "../users/users.repository.interface.js";
import { UserInput } from "../users/users.schema.js";
import { passwordService } from "./password.service.js";

export function createAuthService( repository: UserRepository  ){
    return {
        async create(input:UserInput){
            const isUserExistsByEmail = await repository.findUserByEmail(input.email)

            if(isUserExistsByEmail){
                throw new ExistsError("user exists with this error");
            }

            const passwordHash = await passwordService.hash(input.password)
            
            return  await repository.create({name:input.name, email:input.email, passwordHash})
        },
        async findUserByEmail(email:string){
            return await repository.findUserByEmail(email)
        }
    }
}