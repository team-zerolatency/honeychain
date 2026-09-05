import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { Router as ExpressRouter } from "express";
import { LoginSchema } from "@repo/types";
import { loginUser } from "../services/auth.service";
import { verifyRefreshToken, signAccessToken } from "../utils/jwt";
import { env } from "../env";

export const authRouter: ExpressRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" },
});

const REFRESH_COOKIE = "hc_refresh";
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/auth",
};

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const input = LoginSchema.parse(req.body);
    const result = await loginUser(input);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    res.status(200).json({ userId: result.userId, role: result.role, accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: "No refresh token" });
  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    return res.status(200).json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/auth" });
  res.status(204).send();
});