import { Router } from "express";
import { CreateStoreOwnerSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createStoreOwnerAccount } from "../services/auth.service";
import { prisma } from "@repo/database";
import { listShipments, listInventory } from "../services/store-dashboard.service";

export const storeOwnerRouter: ExpressRouter = Router();
storeOwnerRouter.use(authenticate);

storeOwnerRouter.post("/", requireRole("BEEKEEPER"), async (req, res, next) => {
  try {
    const input = CreateStoreOwnerSchema.parse(req.body);
    const issued = await createStoreOwnerAccount(req.user!.id, input);
    res.status(201).json(issued);
  } catch (err) {
    next(err);
  }
});

storeOwnerRouter.get("/", requireRole("BEEKEEPER", "ADMIN"), async (req, res, next) => {
  try {
    const where =
      req.user!.role === "ADMIN"
        ? { role: "STORE_OWNER" as const }
        : { role: "STORE_OWNER" as const, createdById: req.user!.id };
    const owners = await prisma.user.findMany({
      where,
      select: { id: true, name: true, memberId: true, location: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(owners);
  } catch (err) {
    next(err);
  }
});

storeOwnerRouter.get("/shipments", requireRole("STORE_OWNER", "ADMIN"), async (_req, res, next) => {
  try { res.json(await listShipments()); } catch (err) { next(err); }
});

storeOwnerRouter.get("/inventory", requireRole("STORE_OWNER", "ADMIN"), async (_req, res, next) => {
  try { res.json(await listInventory()); } catch (err) { next(err); }
});