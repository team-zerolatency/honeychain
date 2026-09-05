import { z } from "zod";
import { HiveStatusSchema } from "./enums";

export const ApiaryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
});
export type ApiaryCreateInput = z.infer<typeof ApiaryCreateSchema>;

export const ApiarySchema = ApiaryCreateSchema.extend({
  id: z.string().uuid(),
  beekeeperId: z.string().uuid(),
  createdAt: z.coerce.date(),
});
export type Apiary = z.infer<typeof ApiarySchema>;

export const HiveCreateSchema = z.object({
  apiaryId: z.string().uuid(),
  hiveCode: z.string().min(2).max(50),
});
export type HiveCreateInput = z.infer<typeof HiveCreateSchema>;

export const HiveSchema = HiveCreateSchema.extend({
  id: z.string().uuid(),
  status: HiveStatusSchema,
  createdAt: z.coerce.date(),
});
export type Hive = z.infer<typeof HiveSchema>;

export const SensorReadingSchema = z.object({
  hiveId: z.string().uuid(),
  temperature: z.number().min(-20).max(80),
  humidity: z.number().min(0).max(100),
  weight: z.number().min(0),
  acousticScore: z.number().min(0).max(1).optional(),
  timestamp: z.coerce.date(),
});
export type SensorReading = z.infer<typeof SensorReadingSchema>;