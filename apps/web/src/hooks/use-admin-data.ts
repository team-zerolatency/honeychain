import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { CreateBeekeeperInput, IssuedCredentials } from "@repo/types";

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useClusterOverview() {
  const token = useToken();
  return useQuery({ queryKey: ["admin-overview"], queryFn: () => apiFetch<any>("/admin/overview", { token: token! }), enabled: !!token });
}

export function useAllBeekeepers() {
  const token = useToken();
  return useQuery({ queryKey: ["admin-beekeepers"], queryFn: () => apiFetch<any[]>("/admin/beekeepers", { token: token! }), enabled: !!token });
}

export function useVerificationAnalytics() {
  const token = useToken();
  return useQuery({ queryKey: ["verification-analytics"], queryFn: () => apiFetch<any>("/admin/verification-analytics", { token: token! }), enabled: !!token });
}

export function useAuditTrail() {
  const token = useToken();
  return useQuery({ queryKey: ["audit-trail"], queryFn: () => apiFetch<any[]>("/admin/audit", { token: token! }), enabled: !!token });
}

export function useCreateBeekeeperAccount() {
  const token = useToken();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBeekeeperInput) =>
      apiFetch<IssuedCredentials>("/admin/beekeepers", { method: "POST", body: JSON.stringify(input), token: token! }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-beekeepers"] }),
  });
}