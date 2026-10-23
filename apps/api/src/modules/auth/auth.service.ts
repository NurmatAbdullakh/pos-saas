import { ExistsError, UnauthorizedError } from "../../shared/errors.js";
import { UserRepository } from "../users/users.repository.interface.js";
import { UserInput } from "../users/users.schema.js";
import { LoginInput } from "./auth.schema.js";
import { passwordService } from "./password.service.js";

export function createAuthService( repository: UserRepository ){
    return {
        async create(input:UserInput){
            const isUserExistsByEmail = await repository.findUserByEmail(input.email)

            if(isUserExistsByEmail){
                throw new ExistsError("user exists with this email");
            }

            const password_hash = await passwordService.hash(input.password)
            
            return  await repository.create({name:input.name, email:input.email, password_hash})
        },
        async login(input: LoginInput){
            
            const foundUserByEmail = await repository.findUserByEmail(input.email)
            if(!foundUserByEmail) throw new UnauthorizedError("Invalid email or password")
            
            const {password_hash}= foundUserByEmail
            const isPasswordVerified = await  passwordService.verify(password_hash, input.password)
            if(!isPasswordVerified) throw new UnauthorizedError("Invalid email or password")

            return {name:foundUserByEmail.name, email:foundUserByEmail.email, id:foundUserByEmail.id}
        }
    }
}