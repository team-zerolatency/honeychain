"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { Link } from "@/i18n/navigation";
import { HexCard } from "@repo/ui/hex-card";
import { useHive, useHiveReadings } from "@/hooks/use-beekeeper-data";
import { useHiveInsight } from "@/hooks/use-beekeeper-data";

export default function HiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("dashboard.hive");
  const hiveQuery = useHive(id);
  const readingsQuery = useHiveReadings(id);
  const insightQuery = useHiveInsight(id);

  const latestReading = readingsQuery.data?.[0];

  const chartData = (readingsQuery.data ?? [])
    .slice()
    .reverse()
    .map((r: any) => ({ time: format(new Date(r.timestamp), "MMM d, HH:mm"), temperature: r.temperature, humidity: r.humidity, weight: r.weight }));

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">{t("back")}</Link>
      <h1 className="mt-4 font-display text-2xl">{hiveQuery.data?.hiveCode ?? "…"}</h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium">{t("sensorHistory")}</p>
          {latestReading && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-verify-red/30 bg-verify-red/10 px-2.5 py-1 font-medium text-verify-red">
                <span className="h-2 w-2 rounded-full bg-verify-red" />
                {t("temperature")}: {Number(latestReading.temperature).toFixed(1)} °C
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-medium text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {t("humidity")}: {Number(latestReading.humidity).toFixed(0)} %
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-verify-green/30 bg-verify-green/10 px-2.5 py-1 font-medium text-verify-green">
                <span className="h-2 w-2 rounded-full bg-verify-green" />
                {t("weight")}: {Number(latestReading.weight).toFixed(1)} kg
              </span>
            </div>
          )}
        </div>
        {readingsQuery.isLoading && <div className="mt-3 h-64 animate-pulse rounded-xl bg-surface-2" />}
        {!readingsQuery.isLoading && chartData.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">{t("noReadings")}</p>
        )}
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: any, name: any) => [`${value}`, name]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name={`${t("temperature")} (°C)`}
                stroke="var(--verify-red)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                name={`${t("humidity")} (%)`}
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name={`${t("weight")} (kg)`}
                stroke="var(--verify-green)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <HexCard className="mt-6">
        <p className="font-medium">{t("aiInsight")}</p>
        {insightQuery.isLoading && <div className="mt-3 h-16 animate-pulse rounded-xl bg-surface-2" />}
        {insightQuery.data?.available === false && (
          <p className="mt-2 text-sm text-muted-foreground">{t("aiComingSoon")}</p>
        )}
        {insightQuery.data?.available === true && (
          <div className="mt-2 space-y-1">
            <p className={`text-sm font-medium ${insightQuery.data.status === "ANOMALY" ? "text-verify-red" : "text-verify-green"}`}>
              {t("anomalyStatus")}: {insightQuery.data.status === "ANOMALY" ? t("statusAnomaly") : t("statusNormal")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("expectedYield")}: {insightQuery.data.expected_yield_kg} kg
            </p>
          </div>
        )}
      </HexCard>
    </div>
  );
}