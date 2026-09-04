import argon2 from "argon2";
import { prisma } from "@repo/database";
import type { UserCreateInput, LoginInput, Role } from "@repo/types";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

// ADMIN accounts are provisioned separately (seed script / invited by an existing
// admin) — never through the open registration endpoint.
const SELF_REGISTERABLE_ROLES = new Set<Role>(["BEEKEEPER", "STORE_OWNER"]);

export async function registerUser(input: UserCreateInput) {
  if (!SELF_REGISTERABLE_ROLES.has(input.role)) {
    throw new AuthError("This role cannot self-register", 403);
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      organizationId: input.organizationId,
    },
  });

  return issueTokens(user.id, user.role);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthError("Invalid email or password", 401);

  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) throw new AuthError("Invalid email or password", 401);

  return issueTokens(user.id, user.role);
}

function issueTokens(userId: string, role: Role) {
  const payload = { sub: userId, role };
  return {
    userId,
    role,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}