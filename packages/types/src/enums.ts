import { z } from "zod";

export const RoleSchema = z.enum(["ADMIN", "BEEKEEPER", "STORE_OWNER"]);
export type Role = z.infer<typeof RoleSchema>;

export const HiveStatusSchema = z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]);
export type HiveStatus = z.infer<typeof HiveStatusSchema>;

// Also doubles as bottle status — same lifecycle applies to both batch and bottle
export const LifecycleStateSchema = z.enum([
  "HARVESTED",
  "EXTRACTED",
  "PACKED",
  "DISPATCHED",
  "RECEIVED",
  "AVAILABLE_FOR_SALE",
]);
export type LifecycleState = z.infer<typeof LifecycleStateSchema>;

export const VerificationOutcomeSchema = z.enum(["GREEN", "YELLOW", "RED"]);
export type VerificationOutcome = z.infer<typeof VerificationOutcomeSchema>;