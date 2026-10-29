import { id } from "../../shared/types.js"
import { businessesRepository } from "./businesses.repository.js"

export const businessesService = {
    async create(input:{name:string, userId: id}){
        return  await businessesRepository.create({
            name: input.name,
            created_by: input.userId
        })
    },
    async getAll(created_by: id){
        return await businessesRepository.getAll(created_by)
    },
    async getById(id:id){
        return await businessesRepository.getById(id)
    },
    async deleteById(id:id){
        return await businessesRepository.deleteById(id)
    },
    async updateById(input:{name:string, id: id}){
        return await businessesRepository.updateById(input)
    }
}