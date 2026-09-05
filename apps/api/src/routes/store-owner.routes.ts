import { Router } from "express";
import { CreateStoreOwnerSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createStoreOwnerAccount } from "../services/auth.service";

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