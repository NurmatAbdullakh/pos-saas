
import type { CreateProductInput } from "./product.schema.js";
import type { ProductRepository } from "./product.repository.interface.js";

// SERVICE FACTORY: получает репозиторий извне.
// Бизнес-логика больше не выбирает способ хранения данных.

export function createProductService(repository: ProductRepository) {
  return {
    createProduct(input: CreateProductInput) {
      return repository.save(input);
    },

    getAllProducts() {
      return repository.findAll();
    },
  };
}