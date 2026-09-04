import { Router } from "express";
import { BottleCreateSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createBottle, getBottleWithOwnershipCheck } from "../services/bottle.service";

export const bottleRouter: ExpressRouter = Router();
bottleRouter.use(authenticate);

bottleRouter.post("/", requireRole("BEEKEEPER", "ADMIN"), async (req, res, next) => {
  try {
    const input = BottleCreateSchema.parse(req.body);
    const bottle = await createBottle(req.user!.id, req.user!.role, input);
    res.status(201).json(bottle);
  } catch (err) {
    next(err);
  }
});

bottleRouter.get("/:id", async (req, res, next) => {
  try {
    const bottle = await getBottleWithOwnershipCheck(req.params.id, req.user!.id, req.user!.role);
    res.json(bottle);
  } catch (err) {
    next(err);
  }
});