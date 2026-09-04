import { z } from "zod";

export const QualityCertificateCreateSchema = z.object({
  batchId: z.string().uuid(),
  certificateRef: z.string().min(2),
  metadataHash: z.string().min(10),
  issuer: z.string().min(2),
  date: z.coerce.date(),
});
export type QualityCertificateCreateInput = z.infer<typeof QualityCertificateCreateSchema>;

export const QualityCertificateSchema = QualityCertificateCreateSchema.extend({
  id: z.string().uuid(),
});
export type QualityCertificate = z.infer<typeof QualityCertificateSchema>;