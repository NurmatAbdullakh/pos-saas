import { id } from "../../shared/types.js"
import { businessesRepository } from "./businesses.repository.js"
import { CreateBusinessRepositoryInput } from "./businesses.type.js"

export const businessesService = {
    async create(input:CreateBusinessRepositoryInput){
        return  await businessesRepository.create({
            name: input.name,
            created_by: input.created_by
        })
    },
    async getAll(created_by: id){
        return await businessesRepository.getAll(created_by)
    },
    async getById(id:id,created_by: id){
        return await businessesRepository.getById(id,created_by)
    },
    async deleteById(id:id,created_by: id){
        return await businessesRepository.deleteById(id,created_by)
    },
    async updateById(input:{name:string, id: id},created_by: id){
        return await businessesRepository.updateById(input,created_by)
    }
}