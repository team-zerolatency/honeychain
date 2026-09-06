import { prisma } from "@repo/database";
import { env } from "../env";
import { NotFoundError } from "./errors";
import { getHiveWithOwnershipCheck } from "./hive.service";
import type { Role } from "@repo/types";

const SEASON_BY_MONTH = [
  "winter", "winter", "spring", "spring", "spring", "summer",
  "summer", "summer", "autumn", "autumn", "autumn", "winter",
];

export async function getHiveInsight(hiveId: string, userId: string, role: Role) {
  await getHiveWithOwnershipCheck(hiveId, userId, role);

  const readings = await prisma.sensorReading.findMany({
    where: { hiveId },
    orderBy: { timestamp: "desc" },
    take: 2,
  });

  const [latest, previous] = readings;
  if (!latest || !previous) {
    return { available: false, reason: "not_enough_data" as const };
  }

  const weightChange = latest.weight - previous.weight;
  const season = SEASON_BY_MONTH[new Date().getMonth()];

  const readingPayload = {
    temperature: latest.temperature,
    humidity: latest.humidity,
    weight: latest.weight,
    weight_change: weightChange,
    acoustic_features: latest.acousticScore ?? 0.5,
  };

  try {
    const [anomalyRes, yieldRes] = await Promise.all([
      fetch(`${env.AI_SERVICE_URL}/predict/anomaly`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(readingPayload),
      }),
      fetch(`${env.AI_SERVICE_URL}/predict/yield`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...readingPayload, season }),
      }),
    ]);

    if (!anomalyRes.ok || !yieldRes.ok) {
      return { available: false, reason: "ai_service_unavailable" as const };
    }

    const anomaly = await anomalyRes.json();
    const yieldPrediction = await yieldRes.json();
    return { available: true, ...anomaly, ...yieldPrediction };
  } catch {
    return { available: false, reason: "ai_service_unavailable" as const };
  }
}