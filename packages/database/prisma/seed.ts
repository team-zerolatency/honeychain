import argon2 from "argon2";
import { prisma } from "../src/index";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@honeychain.test";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme-admin-pw";

  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    admin = await prisma.user.create({
      data: { name: "KVIC Admin", email, passwordHash, role: "ADMIN" },
    });
    console.log(`Seeded admin: ${admin.email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  // Seed demo beekeeper for testing and web app login
  const demoMemberId = process.env.SEED_BEEKEEPER_ID ?? "BK-2026-DEMO01";
  const demoPassword = process.env.SEED_BEEKEEPER_PASSWORD ?? "beekeeper12345";

  const existingBk = await prisma.user.findUnique({ where: { memberId: demoMemberId } });
  if (!existingBk) {
    const bkHash = await argon2.hash(demoPassword, { type: argon2.argon2id });
    const beekeeper = await prisma.user.create({
      data: {
        name: "Demo Beekeeper",
        memberId: demoMemberId,
        passwordHash: bkHash,
        role: "BEEKEEPER",
        createdById: admin.id,
      },
    });
    console.log(`\n--- Demo Beekeeper Credentials ---`);
    console.log(`Beekeeper ID: ${beekeeper.memberId}`);
    console.log(`Password:     ${demoPassword}`);
    console.log(`-----------------------------------\n`);
  } else {
    console.log(`\nDemo beekeeper already exists: ${demoMemberId} (Password: ${demoPassword})\n`);
  }
}

main().finally(() => prisma.$disconnect());