import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { businessesApi } from "../api/businesses.api";
import type { BusinessInput } from "../types/business.types";

export const businessKeys = {
  all: ["businesses"] as const,
};

export function useBusinesses(token: string) {
  return useQuery({
    queryKey: businessKeys.all,
    queryFn: () => businessesApi.list(token),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useBusinessMutations(token: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: businessKeys.all });

  const create = useMutation({
    mutationFn: (input: BusinessInput) => businessesApi.create(token, input),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: BusinessInput }) => businessesApi.update(token, id, input),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => businessesApi.remove(token, id),
    onSuccess: refresh,
  });

  return { create, update, remove };
}
