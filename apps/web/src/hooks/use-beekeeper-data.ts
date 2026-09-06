import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { BottleCreateInput } from "@repo/types";
import type {
  ApiaryCreateInput, HiveCreateInput, HarvestCreateInput, BatchCreateInput,
  CreateStoreOwnerInput, IssuedCredentials,
} from "@repo/types";

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useApiaries() {
  const token = useToken();
  return useQuery({
    queryKey: ["apiaries"],
    queryFn: () => apiFetch<any[]>("/apiaries", { token: token! }),
    enabled: !!token,
  });
}

export function useHives(apiaryId?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["hives", apiaryId],
    queryFn: () => apiFetch<any[]>(`/hives${apiaryId ? `?apiaryId=${apiaryId}` : ""}`, { token: token! }),
    enabled: !!token,
  });
}

export function useHive(hiveId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["hive", hiveId],
    queryFn: () => apiFetch<any>(`/hives/${hiveId}`, { token: token! }),
    enabled: !!token && !!hiveId,
  });
}

export function useHiveReadings(hiveId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["hive-readings", hiveId],
    queryFn: () => apiFetch<any[]>(`/hives/${hiveId}/readings`, { token: token! }),
    enabled: !!token && !!hiveId,
  });
}

export function useHarvests() {
  const token = useToken();
  return useQuery({
    queryKey: ["harvests"],
    queryFn: () => apiFetch<any[]>("/harvests", { token: token! }),
    enabled: !!token,
  });
}

export function useStoreOwners() {
  const token = useToken();
  return useQuery({
    queryKey: ["store-owners"],
    queryFn: () => apiFetch<any[]>("/store-owners", { token: token! }),
    enabled: !!token,
  });
}

export function useHiveInsight(hiveId: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["hive-insight", hiveId],
    queryFn: () => apiFetch<any>(`/hives/${hiveId}/insights`, { token: token! }),
    enabled: !!token && !!hiveId,
    refetchInterval: 30000, // matches the ESP32's 30s reporting cadence from Phase 16
  });
}

function useAuthedMutation<TInput, TOutput>(path: string, invalidateKeys: string[][]) {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => apiFetch<TOutput>(path, { method: "POST", body: JSON.stringify(input), token: token! }),
    onSuccess: () => invalidateKeys.forEach((key) => client.invalidateQueries({ queryKey: key })),
  });
}

export const useCreateApiary = () => useAuthedMutation<ApiaryCreateInput, any>("/apiaries", [["apiaries"]]);
export const useCreateHive = () => useAuthedMutation<HiveCreateInput, any>("/hives", [["hives"]]);
export const useCreateHarvest = () => useAuthedMutation<HarvestCreateInput, any>("/harvests", [["harvests"]]);
export const useCreateBatch = () => useAuthedMutation<BatchCreateInput, any>("/batches", [["harvests"]]);
export const useCreateStoreOwner = () =>
  useAuthedMutation<CreateStoreOwnerInput, IssuedCredentials>("/store-owners", [["store-owners"]]);
export const useCreateBottle = () => useAuthedMutation<BottleCreateInput, any>("/bottles", [["bottles"]]);
export const useRecordLifecycleEvent = () =>
  useAuthedMutation<{ batchId?: string; bottleId?: string; eventType: string; location?: string }, any>(
    "/events",
    [["harvests"], ["batches"]]
  );