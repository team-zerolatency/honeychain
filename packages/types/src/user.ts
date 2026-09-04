import { z } from "zod";
import { RoleSchema } from "./enums.js";

export const UserCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: RoleSchema,
  organizationId: z.string().uuid().optional(),
});
export type UserCreateInput = z.infer<typeof UserCreateSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  organizationId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;