import { useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { getRefreshToken, clearRefreshToken } from "@/lib/secure-storage";
import { useAuthStore } from "@/stores/auth-store";

export function AuthBootstrap() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);

  useEffect(() => {
    (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return setBootstrapped();

      try {
        const { accessToken } = await apiFetch<{ accessToken: string }>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
        const me = await apiFetch<{ id: string; role: any }>("/me", { token: accessToken });
        setAuth({ accessToken, userId: me.id, role: me.role });
      } catch {
        await clearRefreshToken(); // stale/expired — clear it rather than retry forever
      } finally {
        setBootstrapped();
      }
    })();
  }, [setAuth, setBootstrapped]);

  return null;
}