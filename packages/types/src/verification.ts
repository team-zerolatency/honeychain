import { z } from "zod";
import { VerificationOutcomeSchema } from "./enums.js";

export const ScratchVerifySchema = z.object({
  qrToken: z.string().min(20),
  scratchCode: z.string().min(6).max(20),
});
export type ScratchVerifyInput = z.infer<typeof ScratchVerifySchema>;

export const VerificationResultSchema = z.object({
  outcome: VerificationOutcomeSchema,
  bottleCode: z.string().optional(),
  batchCode: z.string().optional(),
  lifecycle: z
    .array(
      z.object({
        eventType: z.string(),
        timestamp: z.coerce.date(),
        location: z.string().nullable(),
      })
    )
    .optional(),
  message: z.string(),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;