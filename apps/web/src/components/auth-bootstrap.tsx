"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function AuthBootstrap() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped) return;
    apiFetch<{ accessToken: string }>("/auth/refresh", { method: "POST" })
      .then(async ({ accessToken }) => {
        const me = await apiFetch<{ id: string; role: any }>("/me", { token: accessToken });
        setAuth({ accessToken, userId: me.id, role: me.role });
      })
      .catch(() => {})
      .finally(() => setBootstrapped());
  }, [isBootstrapped, setAuth, setBootstrapped]);

  return null;
}