import argon2 from "argon2";
import { prisma } from "@repo/database";
import type { CreateBeekeeperInput, CreateStoreOwnerInput, LoginInput, Role, IssuedCredentials } from "@repo/types";
import { AppError as AuthError } from "./errors";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { generateMemberId, generateTemporaryPassword } from "../utils/crypto";

export { AuthError };

export async function createBeekeeperAccount(
  adminUserId: string,
  input: CreateBeekeeperInput
): Promise<IssuedCredentials> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await argon2.hash(temporaryPassword, { type: argon2.argon2id });

  for (let attempt = 0; attempt < 3; attempt++) {
    const memberId = generateMemberId("BK");
    try {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          memberId,
          passwordHash,
          role: "BEEKEEPER",
          organizationId: input.organizationId,
          createdById: adminUserId,
        },
      });
      return { userId: user.id, memberId, temporaryPassword, role: "BEEKEEPER" };
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 2) continue; // memberId collision, retry
      throw err;
    }
  }
  throw new AuthError("Failed to create beekeeper account", 500);
}

export async function createStoreOwnerAccount(
  beekeeperUserId: string,
  input: CreateStoreOwnerInput
): Promise<IssuedCredentials> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await argon2.hash(temporaryPassword, { type: argon2.argon2id });

  for (let attempt = 0; attempt < 3; attempt++) {
    const memberId = generateMemberId("SO");
    try {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          memberId,
          location: input.location,
          passwordHash,
          role: "STORE_OWNER",
          createdById: beekeeperUserId,
        },
      });
      return { userId: user.id, memberId, temporaryPassword, role: "STORE_OWNER" };
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 2) continue;
      throw err;
    }
  }
  throw new AuthError("Failed to create store owner account", 500);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: input.identifier }, { memberId: input.identifier }] },
  });
  if (!user) throw new AuthError("Invalid credentials", 401);

  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) throw new AuthError("Invalid credentials", 401);

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