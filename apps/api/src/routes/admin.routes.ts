import { Router } from "express";
import { CreateBeekeeperSchema } from "@repo/types";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { createBeekeeperAccount } from "../services/auth.service";
import { listAllBeekeepers, getClusterOverview, getVerificationAnalytics, getAuditTrail } from "../services/admin.service";

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

adminRouter.get("/beekeepers", requireRole("ADMIN"), async (req, res, next) => {
  try { res.json(await listAllBeekeepers()); } catch (err) { next(err); }
});

adminRouter.get("/overview", requireRole("ADMIN"), async (req, res, next) => {
  try { res.json(await getClusterOverview()); } catch (err) { next(err); }
});

adminRouter.get("/verification-analytics", requireRole("ADMIN"), async (req, res, next) => {
  try { res.json(await getVerificationAnalytics()); } catch (err) { next(err); }
});

adminRouter.get("/audit", requireRole("ADMIN"), async (req, res, next) => {
  try { res.json(await getAuditTrail()); } catch (err) { next(err); }
});