import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./env";
import { authRouter } from "./routes/auth.routes";
import { errorHandler } from "./middleware/error-handler";
import { authenticate } from "./middleware/authenticate";
import { requireRole } from "./middleware/require-role";
import { apiaryRouter } from "./routes/apiary.routes";
import { hiveRouter } from "./routes/hive.routes";
import { harvestRouter } from "./routes/harvest.routes";
import { batchRouter } from "./routes/batch.routes";
import { bottleRouter } from "./routes/bottle.routes";
import { verificationRouter } from "./routes/verification.routes";
import { eventsRouter } from "./routes/lifecycle.routes";

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  if (env.NODE_ENV !== "test") app.use(pinoHttp());
  
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/auth", authRouter);

  app.use("/apiaries", apiaryRouter);
  app.use("/hives", hiveRouter);
  app.use("/harvests", harvestRouter);
  app.use("/batches", batchRouter);
  app.use("/bottles", bottleRouter);
  app.use("/verify", verificationRouter);
  app.use("/events", eventsRouter);

  // Proves auth + RBAC work end-to-end — real domain routes start in Phase 4
  app.get("/me", authenticate, (req, res) => {
    res.json({ id: req.user!.id, role: req.user!.role });
  });
  app.get("/admin/ping", authenticate, requireRole("ADMIN"), (_req, res) => {
    res.json({ message: "pong, admin" });
  });

  app.use(errorHandler);
  return app;
}