"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@repo/types";

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4 px-6 py-16">
      <div className="h-8 w-1/3 rounded bg-surface-2" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-2" />)}
      </div>
    </div>
  );
}

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const userRole = useAuthStore((s) => s.role);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapped && userRole !== role) router.replace("/login");
  }, [isBootstrapped, userRole, role, router]);

  if (!isBootstrapped) return <DashboardSkeleton />;
  if (userRole !== role) return null;
  return <>{children}</>;
}