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

  let beekeeper = await prisma.user.findUnique({ where: { memberId: demoMemberId } });
  if (!beekeeper) {
    const bkHash = await argon2.hash(demoPassword, { type: argon2.argon2id });
    beekeeper = await prisma.user.create({
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

  const existingApiary = await prisma.apiary.findFirst({ where: { beekeeperId: beekeeper.id } });
  const apiary = existingApiary ?? await prisma.apiary.create({
    data: {
      beekeeperId: beekeeper.id,
      name: "Sunrise Honey Apiary",
      location: "Pune, Maharashtra",
    },
  });

  const hiveDefinitions = [
    { hiveCode: "SUNRISE-H01", status: "ACTIVE" as const, temperature: 34.2, humidity: 61, weight: 38.4 },
    { hiveCode: "SUNRISE-H02", status: "ACTIVE" as const, temperature: 33.7, humidity: 64, weight: 41.1 },
    { hiveCode: "SUNRISE-H03", status: "MAINTENANCE" as const, temperature: 29.8, humidity: 72, weight: 26.7 },
  ];

  for (const [hiveIndex, definition] of hiveDefinitions.entries()) {
    const hive = await prisma.hive.upsert({
      where: { hiveCode: definition.hiveCode },
      update: { status: definition.status, apiaryId: apiary.id },
      create: { hiveCode: definition.hiveCode, status: definition.status, apiaryId: apiary.id },
    });

    const readingCount = await prisma.sensorReading.count({ where: { hiveId: hive.id } });
    if (readingCount === 0) {
      await prisma.sensorReading.createMany({
        data: Array.from({ length: 14 }, (_, offset) => ({
          hiveId: hive.id,
          temperature: Number((definition.temperature + Math.sin(offset) * 0.8).toFixed(1)),
          humidity: Math.round(definition.humidity + Math.cos(offset) * 2),
          weight: Number((definition.weight - (13 - offset) * 0.18 + hiveIndex * 0.2).toFixed(1)),
          acousticScore: Number((0.72 + Math.sin(offset) * 0.04).toFixed(2)),
          timestamp: new Date(Date.now() - (13 - offset) * 24 * 60 * 60 * 1000),
        })),
      });
    }

    const harvestCount = await prisma.harvest.count({ where: { hiveId: hive.id } });
    if (harvestCount === 0) {
      await prisma.harvest.create({
        data: {
          hiveId: hive.id,
          beekeeperId: beekeeper.id,
          quantity: Number((18 + hiveIndex * 4.5).toFixed(1)),
          harvestDate: new Date(Date.now() - (hiveIndex + 1) * 7 * 24 * 60 * 60 * 1000),
          location: apiary.location,
        },
      });
    }
  }

  console.log(`Seeded presentation data for ${apiary.name}: ${hiveDefinitions.length} hives, sensor history, and harvests.`);
}

main().finally(() => prisma.$disconnect());