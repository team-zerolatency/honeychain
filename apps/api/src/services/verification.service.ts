import { prisma } from "@repo/database";
import type { VerificationResult } from "@repo/types";
import { hashScratchCode } from "../utils/crypto";

// Signal thresholds — per PRD Section 6 ("Signals"). Tune these once we have real usage data.
const RAPID_RESCAN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const HIGH_FREQUENCY_THRESHOLD = 20; // total prior successful scans

export async function resolveToken(qrToken: string) {
  return prisma.bottle.findUnique({
    where: { qrToken },
    select: { id: true, bottleCode: true, status: true },
  });
}

export async function verifyScratch(
  qrToken: string,
  scratchCode: string,
  location?: string
): Promise<VerificationResult> {
  const bottle = await prisma.bottle.findUnique({ where: { qrToken }, include: { batch: true } });

  if (!bottle) {
    // No bottle to attach a scan record to — this is simply an unknown/invalid token.
    return { outcome: "RED", message: "Invalid QR code" };
  }

  const inputHash = hashScratchCode(scratchCode);
  if (inputHash !== bottle.scratchHash) {
    await prisma.verificationScan.create({
      data: { bottleId: bottle.id, outcome: "RED", location, signals: { reason: "scratch_mismatch" } },
    });
    return { outcome: "RED", message: "Invalid scratch code" };
  }

  // Scratch matched — bottle + scratch are both authentic. Evaluate secondary risk signals.
  // Per PRD: don't equate multiple scans alone with counterfeit — genuine products get scanned
  // by multiple people. These signals produce caution (YELLOW), never an automatic RED.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- values are JSON-serializable; Prisma validates at runtime
  const signals: Record<string, any> = {};
  let outcome: "GREEN" | "YELLOW" = "GREEN";

  const isAvailableForSale =
    bottle.status === "AVAILABLE_FOR_SALE" || bottle.batch?.status === "AVAILABLE_FOR_SALE";

  let cautionDetail = "";

  if (!isAvailableForSale) {
    signals.lifecycleInconsistent = { status: bottle.status, batchStatus: bottle.batch?.status };
    outcome = "YELLOW";
    cautionDetail = "Product is authentic, but lifecycle is not yet marked as Available for Sale in store inventory.";
  }

  const recentScan = await prisma.verificationScan.findFirst({
    where: {
      bottleId: bottle.id,
      outcome: { in: ["GREEN", "YELLOW"] },
      scannedAt: { gte: new Date(Date.now() - RAPID_RESCAN_WINDOW_MS) },
    },
    orderBy: { scannedAt: "desc" },
  });
  if (recentScan) {
    signals.rapidRescan = { previousScanAt: recentScan.scannedAt };
    outcome = "YELLOW";
    cautionDetail = "Rapid rescan detected: this bottle was already verified within the last 5 minutes.";
  }

  const priorScanCount = await prisma.verificationScan.count({
    where: { bottleId: bottle.id, outcome: { in: ["GREEN", "YELLOW"] } },
  });
  if (priorScanCount >= HIGH_FREQUENCY_THRESHOLD) {
    signals.highScanFrequency = { priorScanCount };
    outcome = "YELLOW";
    cautionDetail = "High scan frequency: this code has been verified unusually many times.";
  }

  await prisma.verificationScan.create({ data: { bottleId: bottle.id, outcome, location, signals } });

  const events = await prisma.supplyChainEvent.findMany({
    where: { OR: [{ bottleId: bottle.id }, { batchId: bottle.batchId }] },
    orderBy: { timestamp: "asc" },
    select: { eventType: true, timestamp: true, location: true },
  });

  return {
    outcome,
    bottleCode: bottle.bottleCode,
    batchCode: bottle.batch.batchCode,
    lifecycle: events,
    message:
      outcome === "GREEN"
        ? "Product verified — no anomalies detected."
        : cautionDetail || "Product record found, but a verification signal warrants caution.",
  };
}