import { Router } from "express";
import { BatchCreateSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { listEventsForBatch } from "../services/lifecycle.service";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createBatch, getBatchWithOwnershipCheck } from "../services/batch.service";

export const batchRouter: ExpressRouter = Router();
batchRouter.use(authenticate);

batchRouter.post("/", requireRole("BEEKEEPER", "ADMIN"), async (req, res, next) => {
  try {
    const input = BatchCreateSchema.parse(req.body);
    const batch = await createBatch(req.user!.id, req.user!.role, input);
    res.status(201).json(batch);
  } catch (err) {
    next(err);
  }
});

batchRouter.get("/:id", async (req, res, next) => {
  try {
    const batch = await getBatchWithOwnershipCheck(req.params.id, req.user!.id, req.user!.role);
    res.json(batch);
  } catch (err) {
    next(err);
  }
});

batchRouter.get("/:id/events", async (req, res, next) => {
  try {
    const events = await listEventsForBatch(req.params.id, req.user!.id, req.user!.role);
    res.json(events);
  } catch (err) {
    next(err);
  }
});