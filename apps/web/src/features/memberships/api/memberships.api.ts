import { apiRequest, jsonBody } from "../../../shared/api/api-client";
import type { BusinessMember, CreateMemberInput, MemberRole } from "../types/membership.types";

const endpoint = (businessId: string) => `/api/businesses/${businessId}/members`;

export const membershipsApi = {
  list: (token: string, businessId: string) =>
    apiRequest<BusinessMember[]>(endpoint(businessId), token),
  create: (token: string, businessId: string, input: CreateMemberInput) =>
    apiRequest<{ id: string }>(endpoint(businessId), token, jsonBody(input)),
  updateRole: (token: string, businessId: string, memberId: string, role: MemberRole) =>
    apiRequest<{ id: string }>(`${endpoint(businessId)}/${memberId}`, token, {
      ...jsonBody({ role }),
      method: "PUT",
    }),
  remove: (token: string, businessId: string, memberId: string) =>
    apiRequest<{ id: string }>(`${endpoint(businessId)}/${memberId}`, token, { method: "DELETE" }),
};
