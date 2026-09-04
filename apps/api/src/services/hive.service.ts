import { prisma } from "@repo/database";
import type { HiveCreateInput, Role } from "@repo/types";
import { NotFoundError } from "./errors";
import { getApiaryOrThrow, assertApiaryOwnership } from "./apiary.service";

export async function createHive(userId: string, role: Role, input: HiveCreateInput) {
  const apiary = await getApiaryOrThrow(input.apiaryId);
  assertApiaryOwnership(apiary, userId, role);
  return prisma.hive.create({ data: input });
}

export async function listHives(userId: string, role: Role, apiaryId?: string) {
  if (role === "ADMIN") {
    return prisma.hive.findMany({
      where: apiaryId ? { apiaryId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }
  return prisma.hive.findMany({
    where: { apiary: { beekeeperId: userId }, ...(apiaryId ? { apiaryId } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function getHiveWithOwnershipCheck(hiveId: string, userId: string, role: Role) {
  const hive = await prisma.hive.findUnique({ where: { id: hiveId }, include: { apiary: true } });
  if (!hive) throw new NotFoundError("Hive not found");
  assertApiaryOwnership(hive.apiary, userId, role);
  return hive;
}

export async function getHiveReadings(hiveId: string, userId: string, role: Role, limit = 100) {
  await getHiveWithOwnershipCheck(hiveId, userId, role);
  return prisma.sensorReading.findMany({
    where: { hiveId },
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}