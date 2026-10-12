
import type { CreateProductInput } from "./product.schema.js";

// CONTRACT: описывает, что умеет хранилище товаров,
// но не говорит, как оно реализовано.
export type Product = CreateProductInput & {
  id: string;
};

export interface ProductRepository {
  save(input: CreateProductInput): Product;
  findAll(): Product[];
}