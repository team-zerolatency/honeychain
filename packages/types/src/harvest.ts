import { z } from "zod";

export const HarvestCreateSchema = z.object({
  hiveId: z.string().uuid(),
  quantity: z.number().positive(),
  harvestDate: z.coerce.date(),
  location: z.string().min(2).max(200),
});
export type HarvestCreateInput = z.infer<typeof HarvestCreateSchema>;

export const HarvestSchema = HarvestCreateSchema.extend({
  id: z.string().uuid(),
  beekeeperId: z.string().uuid(),
  createdAt: z.coerce.date(),
});
export type Harvest = z.infer<typeof HarvestSchema>;