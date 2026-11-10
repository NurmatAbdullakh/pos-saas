import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storesApi } from "../api/stores.api";
import type { StoreInput } from "../types/store.types";

export const storeKeys = {
  all: (businessId: string) => ["businesses", businessId, "stores"] as const,
};

export function useStores(token: string, businessId: string) {
  return useQuery({
    queryKey: storeKeys.all(businessId),
    queryFn: () => storesApi.list(token, businessId),
    enabled: Boolean(token && businessId),
    staleTime: 30_000,
  });
}

export function useStoreMutations(token: string, businessId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: storeKeys.all(businessId) });

  const create = useMutation({
    mutationFn: (input: StoreInput) => storesApi.create(token, businessId, input),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: StoreInput }) => storesApi.update(token, businessId, id, input),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => storesApi.remove(token, businessId, id),
    onSuccess: refresh,
  });

  return { create, update, remove };
}
