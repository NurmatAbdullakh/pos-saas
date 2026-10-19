
import type { ProductInput } from "./product.schema.js";
import type {
  Product,
  ProductRepository,
} from "./product.repository.interface.js";
import { pool } from "../../db/pool.js";
import { id } from "../../shared/types.js";
import { ProductNotFoundError } from "../../shared/errors.js";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

export const productRepository: ProductRepository = {
  async save(input: ProductInput): Promise<Product> {
    const id = crypto.randomUUID();

    const result = await pool.query<ProductRow>(
      `INSERT INTO products(id, name, price, is_available)
       VALUES($1, $2, $3, $4)
       RETURNING id, name, price, is_available`,
      [id, input.name, input.price, input.isAvailable])

      const row= result.rows[0]

      if(!row) {
        throw new ProductNotFoundError()
      }

      return {
        id: row.id,
        name:row.name,
        price:row.price,
        isAvailable:row.is_available
      }
  },
  async findAll(): Promise<Product[]> {

    const result= await pool.query<ProductRow>(`
      SELECT id, name, price, is_available
      FROM products
      ORDER BY created_at DESC
    `)

    const row= result.rows

    const mappedRow= row.map(i=>({
      id: i.id,
      name: i.name,
      price: i.price,
      isAvailable: i.is_available
    }));

    return mappedRow
  },
  async findById(id):Promise<Product>{
    const result =await pool.query<ProductRow>(`
      SELECT id, name, price, is_available
      FROM products
      WHERE id =$1
    `, [id])

    const row= result.rows[0]

    if (!row) {
      throw new ProductNotFoundError()
    }
    
    return {
      id: row.id,
      name:row.name,
      price:row.price,
      isAvailable:row.is_available
    }
  },
  async updateById(id, input:ProductInput): Promise<Product>{

    const result = await pool.query<ProductRow>(`
      UPDATE products
      SET name=$1, price=$2, is_available=$3
      WHERE id = $4
      RETURNING id, name, price, is_available
    `,[input.name, input.price, input.isAvailable, id])

    const row = result.rows[0]

    if (!row) {
      throw new ProductNotFoundError()
    }
    
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      isAvailable: row.is_available
    }
  },
  async deleteById(id): Promise<id>{
    const result = await pool.query(`
      DELETE FROM products
      WHERE id=$1
      RETURNING id
    `,[id])

    const row = result.rows[0]

    if (!row) {
      throw new ProductNotFoundError()
    }
    
    return row.id
  }
};