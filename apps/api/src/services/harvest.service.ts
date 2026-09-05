import { prisma } from "@repo/database";
import type { HarvestCreateInput, Role } from "@repo/types";
import { NotFoundError } from "./errors";
import { getHiveWithOwnershipCheck } from "./hive.service";
import { assertApiaryOwnership } from "./apiary.service";

export async function createHarvest(userId: string, role: Role, input: HarvestCreateInput) {
  await getHiveWithOwnershipCheck(input.hiveId, userId, role);
  return prisma.harvest.create({
    data: { ...input, beekeeperId: userId },
  });
}

export async function getHarvestWithOwnershipCheck(harvestId: string, userId: string, role: Role) {
  const harvest = await prisma.harvest.findUnique({
    where: { id: harvestId },
    include: { hive: { include: { apiary: true } } },
  });
  if (!harvest) throw new NotFoundError("Harvest not found");
  assertApiaryOwnership(harvest.hive.apiary, userId, role);
  return harvest;
}

export async function listHarvests(userId: string, role: Role, hiveId?: string) {
  const include = { batch: { select: { id: true, batchCode: true, status: true } } };
  if (role === "ADMIN") {
    return prisma.harvest.findMany({ where: hiveId ? { hiveId } : undefined, include, orderBy: { createdAt: "desc" } });
  }
  return prisma.harvest.findMany({
    where: { beekeeperId: userId, ...(hiveId ? { hiveId } : {}) },
    include,
    orderBy: { createdAt: "desc" },
  });
}