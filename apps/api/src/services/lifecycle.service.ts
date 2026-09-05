import { prisma } from "@repo/database";
import type { SupplyChainEventCreateInput, Role, LifecycleState } from "@repo/types";
import { NotFoundError, ForbiddenError, AppError } from "./errors";
import { getBatchWithOwnershipCheck } from "./batch.service";
import { getBottleWithOwnershipCheck } from "./bottle.service";
import { blockchainAdapter, type OnChainLifecycleState } from "./blockchain-adapter";

const VALID_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  HARVESTED: ["EXTRACTED"],
  EXTRACTED: ["PACKED"],
  PACKED: ["DISPATCHED"],
  DISPATCHED: ["RECEIVED"],
  RECEIVED: ["AVAILABLE_FOR_SALE"],
  AVAILABLE_FOR_SALE: [],
};

const PROCESSING_STAGES: LifecycleState[] = ["EXTRACTED", "PACKED", "DISPATCHED"];
const RECEIVING_STAGES: LifecycleState[] = ["RECEIVED", "AVAILABLE_FOR_SALE"];

function assertValidTransition(current: LifecycleState, next: LifecycleState) {
  const allowed = VALID_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError(`Invalid transition from ${current} to ${next}`, 409);
  }
}

function assertRoleAuthorizedForStage(eventType: LifecycleState, role: Role) {
  if (role === "ADMIN") return;
  if (role === "BEEKEEPER" && PROCESSING_STAGES.includes(eventType)) return;
  if (role === "STORE_OWNER" && RECEIVING_STAGES.includes(eventType)) return;
  throw new ForbiddenError(`Role ${role} cannot record a ${eventType} event`);
}

async function recordOnChainAndAttachHash(
  eventId: string,
  entityId: string,
  isBottle: boolean,
  eventType: keyof typeof OnChainLifecycleState
) {
  let txHash: string | null = null;
  try {
    txHash = await blockchainAdapter.recordEvent(entityId, isBottle, eventType);
  } catch (err) {
    console.error("[lifecycle] blockchain adapter threw unexpectedly:", err);
  }
  if (!txHash) return null;
  const updated = await prisma.supplyChainEvent.update({ where: { id: eventId }, data: { txHash } });
  return updated.txHash;
}

export async function recordEvent(userId: string, role: Role, input: SupplyChainEventCreateInput) {
  assertRoleAuthorizedForStage(input.eventType, role);

  if (input.batchId) {
    const batch =
      role === "STORE_OWNER"
        ? await mustFindBatch(input.batchId)
        : await getBatchWithOwnershipCheck(input.batchId, userId, role);

    assertValidTransition(batch.status, input.eventType);

      const [, event] = await prisma.$transaction([
        prisma.batch.update({ where: { id: batch.id }, data: { status: input.eventType } }),
        prisma.supplyChainEvent.create({
        data: { batchId: batch.id, eventType: input.eventType, actorId: userId, location: input.location },
      }),
    ]);
    const txHash = await recordOnChainAndAttachHash(event.id, batch.id, false, input.eventType);
    return { ...event, txHash };
  }

  // input.bottleId — guaranteed by Zod's refine to have at least one of the two
  const bottle =
    role === "STORE_OWNER"
      ? await mustFindBottle(input.bottleId!)
      : await getBottleWithOwnershipCheck(input.bottleId!, userId, role);

  assertValidTransition(bottle.status, input.eventType);

  const [, event] = await prisma.$transaction([
    prisma.bottle.update({ where: { id: bottle.id }, data: { status: input.eventType } }),
    prisma.supplyChainEvent.create({
    data: { bottleId: bottle.id, eventType: input.eventType, actorId: userId, location: input.location },
      }),
    ]);
    const txHash = await recordOnChainAndAttachHash(event.id, bottle.id, true, input.eventType);
    return { ...event, txHash };
}

async function mustFindBatch(batchId: string) {
  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) throw new NotFoundError("Batch not found");
  return batch;
}

async function mustFindBottle(bottleId: string) {
  const bottle = await prisma.bottle.findUnique({ where: { id: bottleId } });
  if (!bottle) throw new NotFoundError("Bottle not found");
  return bottle;
}

export async function listEventsForBatch(batchId: string, userId: string, role: Role) {
  if (role === "STORE_OWNER") {
    await mustFindBatch(batchId);
  } else {
    await getBatchWithOwnershipCheck(batchId, userId, role);
  }
  return prisma.supplyChainEvent.findMany({ where: { batchId }, orderBy: { timestamp: "asc" } });
}

export async function listEventsForBottle(bottleId: string, userId: string, role: Role) {
  if (role === "STORE_OWNER") {
    await mustFindBottle(bottleId);
  } else {
    await getBottleWithOwnershipCheck(bottleId, userId, role);
  }
  return prisma.supplyChainEvent.findMany({ where: { bottleId }, orderBy: { timestamp: "asc" } });
}