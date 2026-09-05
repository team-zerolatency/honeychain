import { prisma } from "@repo/database";

export async function listAllBeekeepers() {
  return prisma.user.findMany({
    where: { role: "BEEKEEPER" },
    select: {
      id: true, name: true, memberId: true, organizationId: true, createdAt: true,
      _count: { select: { apiaries: true, harvests: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClusterOverview() {
  const [totalBeekeepers, totalHives, totalBatches, totalStoreOwners, totalVerificationScans] = await Promise.all([
    prisma.user.count({ where: { role: "BEEKEEPER" } }),
    prisma.hive.count(),
    prisma.batch.count(),
    prisma.user.count({ where: { role: "STORE_OWNER" } }),
    prisma.verificationScan.count(),
  ]);
  return { totalBeekeepers, totalHives, totalBatches, totalStoreOwners, totalVerificationScans };
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getVerificationAnalytics(days = 14) {
  const since = new Date(Date.now() - days * DAY_MS);
  const scans = await prisma.verificationScan.findMany({
    where: { scannedAt: { gte: since } },
    select: { outcome: true, scannedAt: true },
  });

  const totals = { GREEN: 0, YELLOW: 0, RED: 0 };
  const byDay = new Map<string, { GREEN: number; YELLOW: number; RED: number }>();

  for (const scan of scans) {
    totals[scan.outcome]++;
    const dayKey = scan.scannedAt.toISOString().slice(0, 10);
    if (!byDay.has(dayKey)) byDay.set(dayKey, { GREEN: 0, YELLOW: 0, RED: 0 });
    byDay.get(dayKey)![scan.outcome]++;
  }

  const trend = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  return { totals, trend };
}

export async function getAuditTrail(limit = 50) {
  return prisma.supplyChainEvent.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
    select: {
      id: true, eventType: true, timestamp: true, location: true, txHash: true,
      actor: { select: { name: true, memberId: true, email: true } },
      batch: { select: { batchCode: true } },
      bottle: { select: { bottleCode: true } },
    },
  });
}