import { z } from "zod";
import { RoleSchema } from "./enums";

export const CreateBeekeeperSchema = z.object({
  name: z.string().min(2).max(100),
  organizationId: z.string().uuid().optional(),
});
export type CreateBeekeeperInput = z.infer<typeof CreateBeekeeperSchema>;

export const CreateStoreOwnerSchema = z.object({
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
});
export type CreateStoreOwnerInput = z.infer<typeof CreateStoreOwnerSchema>;

export const IssuedCredentialsSchema = z.object({
  userId: z.string().uuid(),
  memberId: z.string(),
  temporaryPassword: z.string(),
  role: RoleSchema,
});
export type IssuedCredentials = z.infer<typeof IssuedCredentialsSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  memberId: z.string().nullable(),
  location: z.string().nullable(),
  role: RoleSchema,
  organizationId: z.string().uuid().nullable(),
  createdById: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  identifier: z.string().min(1), // email (admin) or memberId (beekeeper/store owner)
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;