import { z } from "zod";
import { LifecycleStateSchema } from "./enums";

export const BatchCreateSchema = z.object({
  harvestId: z.string().uuid(),
  quantity: z.number().positive(),
  processingDate: z.coerce.date(),
});
export type BatchCreateInput = z.infer<typeof BatchCreateSchema>;

export const BatchSchema = BatchCreateSchema.extend({
  id: z.string().uuid(),
  batchCode: z.string().min(5),
  status: LifecycleStateSchema,
  createdAt: z.coerce.date(),
});
export type Batch = z.infer<typeof BatchSchema>;

export const BottleCreateSchema = z.object({
  batchId: z.string().uuid(),
});
export type BottleCreateInput = z.infer<typeof BottleCreateSchema>;

// Public-safe shape — scratchHash must NEVER appear here or leave the DB layer
export const BottleSchema = z.object({
  id: z.string().uuid(),
  batchId: z.string().uuid(),
  bottleCode: z.string().min(5),
  qrToken: z.string().min(20),
  status: LifecycleStateSchema,
  createdAt: z.coerce.date(),
});
export type Bottle = z.infer<typeof BottleSchema>;