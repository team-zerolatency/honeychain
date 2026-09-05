"use client";

import { useTranslations } from "next-intl";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { HexCard } from "@repo/ui/hex-card";
import { useClusterOverview, useVerificationAnalytics } from "@/hooks/use-admin-data";

function StatSkeleton() {
  return <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />;
}

export default function AdminOverviewPage() {
  const t = useTranslations("admin.overview");
  const overviewQuery = useClusterOverview();
  const analyticsQuery = useVerificationAnalytics();

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {overviewQuery.isLoading ? (
          <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
        ) : (
          <>
            <HexCard><p className="text-2xl font-display">{overviewQuery.data?.totalBeekeepers}</p><p className="text-sm text-muted-foreground">{t("totalBeekeepers")}</p></HexCard>
            <HexCard><p className="text-2xl font-display">{overviewQuery.data?.totalHives}</p><p className="text-sm text-muted-foreground">{t("totalHives")}</p></HexCard>
            <HexCard><p className="text-2xl font-display">{overviewQuery.data?.totalBatches}</p><p className="text-sm text-muted-foreground">{t("totalBatches")}</p></HexCard>
            <HexCard><p className="text-2xl font-display">{overviewQuery.data?.totalStoreOwners}</p><p className="text-sm text-muted-foreground">{t("totalStoreOwners")}</p></HexCard>
          </>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
        <p className="font-medium">{t("verificationTrend")}</p>
        {analyticsQuery.isLoading && <div className="mt-3 h-64 animate-pulse rounded-xl bg-surface-2" />}
        {!analyticsQuery.isLoading && analyticsQuery.data?.trend.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">{t("noScansYet")}</p>
        )}
        {analyticsQuery.data?.trend.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analyticsQuery.data.trend} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
              <Legend />
              <Line type="monotone" dataKey="GREEN" stroke="var(--verify-green)" dot={false} />
              <Line type="monotone" dataKey="YELLOW" stroke="var(--verify-yellow)" dot={false} />
              <Line type="monotone" dataKey="RED" stroke="var(--verify-red)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}