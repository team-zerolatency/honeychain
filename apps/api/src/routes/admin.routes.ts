import { Router } from "express";
import { CreateBeekeeperSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createBeekeeperAccount } from "../services/auth.service";

export const adminRouter: ExpressRouter = Router();
adminRouter.use(authenticate);

adminRouter.post("/beekeepers", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = CreateBeekeeperSchema.parse(req.body);
    const issued = await createBeekeeperAccount(req.user!.id, input);
    res.status(201).json(issued);
  } catch (err) {
    next(err);
  }
});