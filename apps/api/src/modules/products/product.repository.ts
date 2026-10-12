
import type { CreateProductInput } from "./product.schema.js";
import type {
  Product,
  ProductRepository,
} from "./product.repository.interface.js";

// Реализация Repository: сейчас данные хранятся в памяти.
const products: Product[] = [];

// TypeScript проверяет, что реализация соответствует контракту.
export const productRepository: ProductRepository = {
  save(input: CreateProductInput): Product {
    const product: Product = {
      id: crypto.randomUUID(),
      ...input,
    };

    products.push(product);

    return product;
  },

  findAll(): Product[] {
    return products;
  },
};