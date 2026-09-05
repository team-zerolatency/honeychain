import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useShipments() {
  const token = useToken();
  return useQuery({ queryKey: ["shipments"], queryFn: () => apiFetch<any[]>("/store-owners/shipments", { token: token! }), enabled: !!token });
}

export function useInventory() {
  const token = useToken();
  return useQuery({ queryKey: ["inventory"], queryFn: () => apiFetch<any[]>("/store-owners/inventory", { token: token! }), enabled: !!token });
}

export function useRecordStoreEvent() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { batchId: string; eventType: "RECEIVED" | "AVAILABLE_FOR_SALE" }) =>
      apiFetch("/events", { method: "POST", body: JSON.stringify(input), token: token! }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["shipments"] });
      client.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}