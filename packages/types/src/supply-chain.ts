import { z } from "zod";
import { LifecycleStateSchema } from "./enums";

export const SupplyChainEventCreateSchema = z
  .object({
    batchId: z.string().uuid().optional(),
    bottleId: z.string().uuid().optional(),
    eventType: LifecycleStateSchema,
    location: z.string().min(2).max(200).optional(),
  })
  .refine((data) => Boolean(data.batchId || data.bottleId), {
    message: "Either batchId or bottleId must be provided",
  });
export type SupplyChainEventCreateInput = z.infer<typeof SupplyChainEventCreateSchema>;

export const SupplyChainEventSchema = z.object({
  id: z.string().uuid(),
  batchId: z.string().uuid().nullable(),
  bottleId: z.string().uuid().nullable(),
  eventType: LifecycleStateSchema,
  actorId: z.string().uuid(),
  location: z.string().nullable(),
  txHash: z.string().nullable(),
  timestamp: z.coerce.date(),
});
export type SupplyChainEvent = z.infer<typeof SupplyChainEventSchema>;