import { Router } from "express";
import { ApiaryCreateSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createApiary, listApiaries, getApiaryDetail } from "../services/apiary.service";

export const apiaryRouter: ExpressRouter = Router();
apiaryRouter.use(authenticate);

apiaryRouter.post("/", requireRole("BEEKEEPER"), async (req, res, next) => {
  try {
    const input = ApiaryCreateSchema.parse(req.body);
    const apiary = await createApiary(req.user!.id, input);
    res.status(201).json(apiary);
  } catch (err) {
    next(err);
  }
});

apiaryRouter.get("/", async (req, res, next) => {
  try {
    const apiaries = await listApiaries(req.user!.id, req.user!.role);
    res.json(apiaries);
  } catch (err) {
    next(err);
  }
});

apiaryRouter.get("/:id", async (req, res, next) => {
  try {
    const apiary = await getApiaryDetail(req.params.id, req.user!.id, req.user!.role);
    res.json(apiary);
  } catch (err) {
    next(err);
  }
});