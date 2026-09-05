import "dotenv/config";
import { z } from "zod";

const EnvSchema = z
  .object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    JWT_ACCESS_SECRET: z.string().min(10),
    JWT_REFRESH_SECRET: z.string().min(10),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    WEB_ORIGIN: z.string().default("http://localhost:3000"),
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