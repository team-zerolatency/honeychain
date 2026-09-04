-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BEEKEEPER', 'STORE_OWNER');

-- CreateEnum
CREATE TYPE "HiveStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "LifecycleState" AS ENUM ('HARVESTED', 'EXTRACTED', 'PACKED', 'DISPATCHED', 'RECEIVED', 'AVAILABLE_FOR_SALE');

-- CreateEnum
CREATE TYPE "VerificationOutcome" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apiary" (
    "id" TEXT NOT NULL,
    "beekeeperId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Apiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hive" (
    "id" TEXT NOT NULL,
    "apiaryId" TEXT NOT NULL,
    "hiveCode" TEXT NOT NULL,
    "status" "HiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "acousticScore" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,
    "beekeeperId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "processingDate" TIMESTAMP(3) NOT NULL,
    "status" "LifecycleState" NOT NULL DEFAULT 'HARVESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bottle" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "bottleCode" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "scratchHash" TEXT NOT NULL,
    "status" "LifecycleState" NOT NULL DEFAULT 'PACKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bottle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyChainEvent" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "bottleId" TEXT,
    "eventType" "LifecycleState" NOT NULL,
    "actorId" TEXT NOT NULL,
    "location" TEXT,
    "txHash" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationScan" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "outcome" "VerificationOutcome" NOT NULL,
    "location" TEXT,
    "signals" JSONB,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityCertificate" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "certificateRef" TEXT NOT NULL,
    "metadataHash" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "Apiary_beekeeperId_idx" ON "Apiary"("beekeeperId");

-- CreateIndex
CREATE UNIQUE INDEX "Hive_hiveCode_key" ON "Hive"("hiveCode");

-- CreateIndex
CREATE INDEX "Hive_apiaryId_idx" ON "Hive"("apiaryId");

-- CreateIndex
CREATE INDEX "SensorReading_hiveId_timestamp_idx" ON "SensorReading"("hiveId", "timestamp");

-- CreateIndex
CREATE INDEX "Harvest_hiveId_idx" ON "Harvest"("hiveId");

-- CreateIndex
CREATE INDEX "Harvest_beekeeperId_idx" ON "Harvest"("beekeeperId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchCode_key" ON "Batch"("batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_harvestId_key" ON "Batch"("harvestId");

-- CreateIndex
CREATE UNIQUE INDEX "Bottle_bottleCode_key" ON "Bottle"("bottleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Bottle_qrToken_key" ON "Bottle"("qrToken");

-- CreateIndex
CREATE INDEX "Bottle_batchId_idx" ON "Bottle"("batchId");

-- CreateIndex
CREATE INDEX "Bottle_qrToken_idx" ON "Bottle"("qrToken");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_batchId_idx" ON "SupplyChainEvent"("batchId");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_bottleId_idx" ON "SupplyChainEvent"("bottleId");

-- CreateIndex
CREATE INDEX "VerificationScan_bottleId_scannedAt_idx" ON "VerificationScan"("bottleId", "scannedAt");

-- CreateIndex
CREATE INDEX "QualityCertificate_batchId_idx" ON "QualityCertificate"("batchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apiary" ADD CONSTRAINT "Apiary_beekeeperId_fkey" FOREIGN KEY ("beekeeperId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hive" ADD CONSTRAINT "Hive_apiaryId_fkey" FOREIGN KEY ("apiaryId") REFERENCES "Apiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_beekeeperId_fkey" FOREIGN KEY ("beekeeperId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bottle" ADD CONSTRAINT "Bottle_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationScan" ADD CONSTRAINT "VerificationScan_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityCertificate" ADD CONSTRAINT "QualityCertificate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
