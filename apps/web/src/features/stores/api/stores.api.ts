import { apiRequest, jsonBody } from "../../../shared/api/api-client";
import type { Store, StoreInput } from "../types/store.types";

const endpoint = (businessId: string) => `/api/businesses/${businessId}/stores`;

export const storesApi = {
  list: (token: string, businessId: string) => apiRequest<Store[]>(endpoint(businessId), token),
  create: (token: string, businessId: string, input: StoreInput) =>
    apiRequest<Store>(endpoint(businessId), token, jsonBody(input)),
  update: (token: string, businessId: string, storeId: string, input: StoreInput) =>
    apiRequest<Store>(`${endpoint(businessId)}/${storeId}`, token, { ...jsonBody(input), method: "PUT" }),
  remove: (token: string, businessId: string, storeId: string) =>
    apiRequest<{ id: string }>(`${endpoint(businessId)}/${storeId}`, token, { method: "DELETE" }),
};
