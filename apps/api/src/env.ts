import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: process.env.DOTENV_CONFIG_PATH ?? "../../.env" });

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);