import { id } from "../../shared/types.js"
import { CreateStoreInput } from "./stores.schema.js"

export type Store = {
    id: id,
    business_id: id,
    name: string,
    created_at: Date,
    updated_at: Date
}

export type CreateStoreRepositoryInput = CreateStoreInput & { business_id: id }

export type storesRepository = {
    create(input: CreateStoreRepositoryInput ): Promise<Store>

    getAll(business_id: id): Promise<Store[]>

    getById(id: id, business_id: id): Promise<Store>;

    deleteById(
    id: id,
    business_id: id
    ): Promise<Pick<Store, "id">>;
    
    updateById(
        input: CreateStoreInput & { id: id },
        created_by: id
    ): Promise<Store>;
}