import { apiRequest, jsonBody } from "../../../shared/api/api-client";
import type { Business, BusinessInput } from "../types/business.types";

const endpoint = "/api/businesses";

export const businessesApi = {
  list: (token: string) => apiRequest<Business[]>(endpoint, token),
  create: (token: string, input: BusinessInput) =>
    apiRequest<Business>(endpoint, token, jsonBody(input)),
  update: (token: string, id: string, input: BusinessInput) =>
    apiRequest<Business>(`${endpoint}/${id}`, token, { ...jsonBody(input), method: "PUT" }),
  remove: (token: string, id: string) =>
    apiRequest<{ id: string }>(`${endpoint}/${id}`, token, { method: "DELETE" }),
};
