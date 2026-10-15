
import { id } from "../../shared/types.js";
import type { ProductInput } from "./product.schema.js";

export type Product = ProductInput & {
  id: id;
};

export interface ProductRepository {
  save(input: ProductInput): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id:string):Promise<Product>;
  updateById(id:string, input:ProductInput):Promise<Product>;
  deleteById(id:string): Promise<id>;
}