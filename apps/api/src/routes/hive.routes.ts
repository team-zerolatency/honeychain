import { Router } from "express";
import { HiveCreateSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createHive, listHives, getHiveWithOwnershipCheck, getHiveReadings } from "../services/hive.service";

export const hiveRouter: ExpressRouter = Router();
hiveRouter.use(authenticate);

hiveRouter.post("/", requireRole("BEEKEEPER"), async (req, res, next) => {
  try {
    const input = HiveCreateSchema.parse(req.body);
    const hive = await createHive(req.user!.id, req.user!.role, input);
    res.status(201).json(hive);
  } catch (err) {
    next(err);
  }
});

hiveRouter.get("/", async (req, res, next) => {
  try {
    const apiaryId = typeof req.query.apiaryId === "string" ? req.query.apiaryId : undefined;
    const hives = await listHives(req.user!.id, req.user!.role, apiaryId);
    res.json(hives);
  } catch (err) {
    next(err);
  }
});

hiveRouter.get("/:id", async (req, res, next) => {
  try {
    const hive = await getHiveWithOwnershipCheck(req.params.id, req.user!.id, req.user!.role);
    res.json(hive);
  } catch (err) {
    next(err);
  }
});

hiveRouter.get("/:id/readings", async (req, res, next) => {
  try {
    const readings = await getHiveReadings(req.params.id, req.user!.id, req.user!.role);
    res.json(readings);
  } catch (err) {
    next(err);
  }
});