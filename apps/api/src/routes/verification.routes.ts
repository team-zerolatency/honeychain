import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { Router as ExpressRouter } from "express";
import { ScratchVerifySchema } from "@repo/types";
import { resolveToken, verifyScratch } from "../services/verification.service";

export const verificationRouter: ExpressRouter = Router();

// Generous for now since it's public/consumer-facing — proper abuse-tuning + load testing is Phase 21.
const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts, please try again later" },
});

verificationRouter.get("/:token", verifyLimiter, async (req, res, next) => {
  try {
    const token = req.params.token;
    if (typeof token !== "string") return res.status(400).json({ error: "Missing token" });

    const bottle = await resolveToken(token);
    if (!bottle) return res.status(404).json({ error: "Invalid QR code" });
    res.json({ bottleCode: bottle.bottleCode, tokenValid: true });
  } catch (err) {
    next(err);
  }
});

verificationRouter.post("/scratch", verifyLimiter, async (req, res, next) => {
  try {
    const input = ScratchVerifySchema.parse(req.body);
    const location = typeof req.body.location === "string" ? req.body.location : undefined;
    const result = await verifyScratch(input.qrToken, input.scratchCode, location);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});