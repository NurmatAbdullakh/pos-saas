import type { id } from "../../shared/types.js";
import type { CreateBusinessInput } from "./businesses.schema.js";

export type Business = {
  id: id;
  name: string;
  created_by: id;
};

export type BusinessSummary = Pick<Business, "id" | "name">;

export type CreateBusinessRepositoryInput =
  CreateBusinessInput & {
    created_by: id;
  };

export type businessesRepositoryType = {
  create(
    input: CreateBusinessRepositoryInput
  ): Promise<BusinessSummary>;

  getAll(created_by: id): Promise<Business[]>;

  getById(id: id, created_by: id): Promise<Business>;

  deleteById(
    id: id,
    created_by: id
  ): Promise<Pick<Business, "id">>;

  updateById(
    input: CreateBusinessInput & { id: id },
    created_by: id
  ): Promise<BusinessSummary>;
};