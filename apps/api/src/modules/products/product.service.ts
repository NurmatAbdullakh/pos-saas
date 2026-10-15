
import type { ProductInput } from "./product.schema.js";
import type { ProductRepository } from "./product.repository.interface.js";

// SERVICE FACTORY: получает репозиторий извне.
// Бизнес-логика больше не выбирает способ хранения данных.

export function createProductService(repository: ProductRepository) {
  return {
    async createProduct(input: ProductInput) {
      return await repository.save(input); 
    },
   async getAllProducts() {
      return await repository.findAll();
    },
    async findById(id:string){
      return await repository.findById(id)
    },
    async updateById(id:string, input: ProductInput){
      return await repository.updateById(id,input)
    },
    async deleteById(id:string){
      return await repository.deleteById(id)
    }
  };
}