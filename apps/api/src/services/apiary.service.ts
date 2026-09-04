import { prisma } from "@repo/database";
import type { ApiaryCreateInput, Role } from "@repo/types";
import { NotFoundError, ForbiddenError } from "./errors";

export async function createApiary(beekeeperId: string, input: ApiaryCreateInput) {
  return prisma.apiary.create({
    data: { ...input, beekeeperId },
  });
}

export async function listApiaries(userId: string, role: Role) {
  if (role === "ADMIN") {
    return prisma.apiary.findMany({ orderBy: { createdAt: "desc" } });
  }
  return prisma.apiary.findMany({
    where: { beekeeperId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApiaryOrThrow(apiaryId: string) {
  const apiary = await prisma.apiary.findUnique({ where: { id: apiaryId } });
  if (!apiary) throw new NotFoundError("Apiary not found");
  return apiary;
}

export function assertApiaryOwnership(
  apiary: { beekeeperId: string },
  userId: string,
  role: Role
) {
  if (role === "ADMIN") return;
  if (apiary.beekeeperId !== userId) {
    throw new ForbiddenError("You do not own this apiary");
  }
}

export async function getApiaryDetail(apiaryId: string, userId: string, role: Role) {
  const apiary = await getApiaryOrThrow(apiaryId);
  assertApiaryOwnership(apiary, userId, role);
  return apiary;
}