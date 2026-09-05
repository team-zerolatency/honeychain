import { prisma } from "@repo/database";
import type { BottleCreateInput, Role } from "@repo/types";
import { blockchainAdapter } from "./blockchain-adapter";
import { NotFoundError, ForbiddenError, AppError } from "./errors";
import { getBatchWithOwnershipCheck } from "./batch.service";
import { generateQrToken, generateScratchCode, hashScratchCode } from "../utils/crypto";

export async function createBottle(userId: string, role: Role, input: BottleCreateInput) {
  const batch = await getBatchWithOwnershipCheck(input.batchId, userId, role);

  // NOTE: sequence is derived from a simple count — fine for prototype/demo scale, but not
  // safe under real concurrent writes (two simultaneous requests could both count N and
  // collide on bottleCode). Worth revisiting with a DB-level sequence before any real pilot.
  const existingCount = await prisma.bottle.count({ where: { batchId: batch.id } });
  const sequence = String(existingCount + 1).padStart(6, "0");
  const bottleCode = `${batch.batchCode}-${sequence}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const qrToken = generateQrToken();
    const scratchCode = generateScratchCode();
    const scratchHash = hashScratchCode(scratchCode);

    try {
      const bottle = await prisma.bottle.create({
        data: { batchId: batch.id, bottleCode, qrToken, scratchHash },
        select: { id: true, batchId: true, bottleCode: true, qrToken: true, status: true, createdAt: true },
      });
      await blockchainAdapter.registerBottle(bottle.id, bottle.batchId, bottle.bottleCode);
      // scratchCode is returned exactly once, right here — the DB only ever stores its hash.
      return { ...bottle, scratchCode };
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 2) continue; // token collision, retry with fresh values
      throw err;
    }
  }
  throw new AppError("Failed to create bottle", 500);
}

export async function getBottleWithOwnershipCheck(bottleId: string, userId: string, role: Role) {
  const bottle = await prisma.bottle.findUnique({
    where: { id: bottleId },
    select: {
      id: true, batchId: true, bottleCode: true, qrToken: true, status: true, createdAt: true,
      batch: { select: { harvest: { select: { beekeeperId: true } } } },
    },
  });
  if (!bottle) throw new NotFoundError("Bottle not found");
  if (role !== "ADMIN" && bottle.batch.harvest.beekeeperId !== userId) {
    throw new ForbiddenError("You do not own this bottle");
  }
  const { batch, ...safeBottle } = bottle;
  return safeBottle;
}