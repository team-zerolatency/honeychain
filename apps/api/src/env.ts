import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const candidateEnvFiles = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
  resolve(__dirname, "../../.env"),
  resolve(__dirname, "../../../.env"),
];

for (const p of candidateEnvFiles) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
  }
}

const EnvSchema = z
  .object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    JWT_ACCESS_SECRET: z.string().min(10),
    JWT_REFRESH_SECRET: z.string().min(10),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    WEB_ORIGIN: z.string().default("http://localhost:3000"),
    AI_SERVICE_URL: z.string().default("http://localhost:8000"),
    MQTT_ENABLED: z.coerce.boolean().default(false),
    MQTT_BROKER_URL: z.string().default("mqtt://localhost:1883"),
    DATABASE_URL: z.string().min(1),

    BLOCKCHAIN_ENABLED: z
      .string()
      .default("false")
      .transform((v) => v === "true" || v === "1"),
    BLOCKCHAIN_RPC_URL: z.string().optional(),
    BLOCKCHAIN_PRIVATE_KEY: z.string().optional(),
    BLOCKCHAIN_CONTRACT_ADDRESS: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.BLOCKCHAIN_ENABLED) {
      (["BLOCKCHAIN_RPC_URL", "BLOCKCHAIN_PRIVATE_KEY", "BLOCKCHAIN_CONTRACT_ADDRESS"] as const).forEach((key) => {
        if (!data[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when BLOCKCHAIN_ENABLED=true`,
          });
        }
      });
    }
  });

export const env = EnvSchema.parse(process.env);