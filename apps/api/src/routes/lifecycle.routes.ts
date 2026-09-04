import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { SupplyChainEventCreateSchema } from "@repo/types";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { recordEvent } from "../services/lifecycle.service";

export const eventsRouter: ExpressRouter = Router();
eventsRouter.use(authenticate);

eventsRouter.post("/", requireRole("BEEKEEPER", "STORE_OWNER", "ADMIN"), async (req, res, next) => {
  try {
    const input = SupplyChainEventCreateSchema.parse(req.body);
    const event = await recordEvent(req.user!.id, req.user!.role, input);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});