import { Router } from "express";
import { HarvestCreateSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createHarvest, getHarvestWithOwnershipCheck } from "../services/harvest.service";
import { listHarvests } from "../services/harvest.service";

export const harvestRouter: ExpressRouter = Router();
harvestRouter.use(authenticate);

harvestRouter.post("/", requireRole("BEEKEEPER"), async (req, res, next) => {
  try {
    const input = HarvestCreateSchema.parse(req.body);
    const harvest = await createHarvest(req.user!.id, req.user!.role, input);
    res.status(201).json(harvest);
  } catch (err) {
    next(err);
  }
});

harvestRouter.get("/:id", async (req, res, next) => {
  try {
    const harvest = await getHarvestWithOwnershipCheck(req.params.id, req.user!.id, req.user!.role);
    res.json(harvest);
  } catch (err) {
    next(err);
  }
});

harvestRouter.get("/", async (req, res, next) => {
  try {
    const hiveId = typeof req.query.hiveId === "string" ? req.query.hiveId : undefined;
    res.json(await listHarvests(req.user!.id, req.user!.role, hiveId));
  } catch (err) {
    next(err);
  }
});