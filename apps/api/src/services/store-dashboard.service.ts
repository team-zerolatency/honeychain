import { prisma } from "@repo/database";

const actorSelect = {
  harvest: { select: { beekeeper: { select: { name: true, memberId: true } } } },
} as const;

export async function listShipments() {
  return prisma.batch.findMany({
    where: { status: { in: ["DISPATCHED", "RECEIVED"] } },
    include: actorSelect,
    orderBy: { createdAt: "asc" },
  });
}

export async function listInventory() {
  return prisma.batch.findMany({
    where: { status: "AVAILABLE_FOR_SALE" },
    include: actorSelect,
    orderBy: { createdAt: "desc" },
  });
}