import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { membershipsApi } from "../api/memberships.api";
import type { CreateMemberInput, MemberRole } from "../types/membership.types";

export const membershipKeys = {
  all: (businessId: string) => ["businesses", businessId, "members"] as const,
};

export function useMemberships(token: string, businessId: string) {
  return useQuery({
    queryKey: membershipKeys.all(businessId),
    queryFn: () => membershipsApi.list(token, businessId),
    enabled: Boolean(token && businessId),
    staleTime: 30_000,
  });
}

export function useMembershipMutations(token: string, businessId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: membershipKeys.all(businessId) });

  const create = useMutation({
    mutationFn: (input: CreateMemberInput) => membershipsApi.create(token, businessId, input),
    onSuccess: refresh,
  });
  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: MemberRole }) =>
      membershipsApi.updateRole(token, businessId, id, role),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => membershipsApi.remove(token, businessId, id),
    onSuccess: refresh,
  });

  return { create, updateRole, remove };
}
