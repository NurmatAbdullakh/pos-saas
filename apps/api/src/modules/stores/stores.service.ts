import { id } from "../../shared/types.js"
import { storesRepository } from "./stores.repository.js"
import { CreateStoreRepositoryInput } from "./stores.type.js"

export const storesService = {
    async create(input: CreateStoreRepositoryInput){
        return  await storesRepository.create({
            name: input.name,
            business_id: input.business_id
        })
    },
    async getAll(business_id: id){
        return await storesRepository.getAll(business_id)
    },
    async getById(id:id, business_id: id){
        return await storesRepository.getById(id, business_id)
    },
    async deleteById(id:id, business_id: id){
        return await storesRepository.deleteById(id, business_id)
    },
    async updateById(input:{ name:string, id: id}, business_id: id){
        return await storesRepository.updateById(input, business_id)
    }
}