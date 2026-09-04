import crypto from "node:crypto";
import { prisma } from "@repo/database";
import type { BatchCreateInput, Role } from "@repo/types";
import { NotFoundError, ForbiddenError, AppError } from "./errors";
import { getHarvestWithOwnershipCheck } from "./harvest.service";

function generateBatchCode(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `HC-${year}-B${suffix}`;
}

export async function createBatch(userId: string, role: Role, input: BatchCreateInput) {
  await getHarvestWithOwnershipCheck(input.harvestId, userId, role);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.batch.create({
        data: {
          harvestId: input.harvestId,
          batchCode: generateBatchCode(),
          quantity: input.quantity,
          processingDate: input.processingDate,
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        // With driver adapters, meta.target may not be populated. The two unique
        // constraints on Batch are batchCode (random, retried) and harvestId (1:1).
        // Check whether the harvest already has a batch to distinguish the two cases.
        const existing = await prisma.batch.findUnique({ where: { harvestId: input.harvestId } });
        if (existing) {
          throw new AppError("This harvest already has a batch", 409);
        }
        // Otherwise it was a batchCode collision — fall through to retry
      }
      if (attempt === 2) throw err;
      // else: batchCode collision (astronomically unlikely) — retry with a fresh code
    }
  }
  throw new AppError("Failed to create batch", 500);
}

export async function getBatchWithOwnershipCheck(batchId: string, userId: string, role: Role) {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { harvest: { select: { beekeeperId: true } } },
  });
  if (!batch) throw new NotFoundError("Batch not found");
  if (role !== "ADMIN" && batch.harvest.beekeeperId !== userId) {
    throw new ForbiddenError("You do not own this batch");
  }
  return batch;
}