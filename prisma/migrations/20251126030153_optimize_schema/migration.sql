/*
  Warnings:

  - The `status` column on the `Mission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `NPC` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "NPCStatus" AS ENUM ('ALIVE', 'INJURED', 'DEAD');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "MemoryEvent" DROP CONSTRAINT "MemoryEvent_npcId_fkey";

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_giverId_fkey";

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "NPC" DROP CONSTRAINT "NPC_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrustEvent" DROP CONSTRAINT "TrustEvent_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "TrustEvent" DROP CONSTRAINT "TrustEvent_targetId_fkey";

-- DropForeignKey
ALTER TABLE "TrustState" DROP CONSTRAINT "TrustState_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "TrustState" DROP CONSTRAINT "TrustState_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_ownerId_fkey";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "status",
ADD COLUMN     "status" "MissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "NPC" DROP COLUMN "status",
ADD COLUMN     "status" "NPCStatus" NOT NULL DEFAULT 'ALIVE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "MemoryEvent_npcId_idx" ON "MemoryEvent"("npcId");

-- CreateIndex
CREATE INDEX "MemoryEvent_createdAt_idx" ON "MemoryEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Mission_giverId_idx" ON "Mission"("giverId");

-- CreateIndex
CREATE INDEX "Mission_receiverId_idx" ON "Mission"("receiverId");

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");

-- CreateIndex
CREATE INDEX "NPC_factionId_idx" ON "NPC"("factionId");

-- CreateIndex
CREATE INDEX "NPC_userId_idx" ON "NPC"("userId");

-- CreateIndex
CREATE INDEX "TrustEvent_sourceId_idx" ON "TrustEvent"("sourceId");

-- CreateIndex
CREATE INDEX "TrustEvent_targetId_idx" ON "TrustEvent"("targetId");

-- CreateIndex
CREATE INDEX "TrustEvent_createdAt_idx" ON "TrustEvent"("createdAt");

-- CreateIndex
CREATE INDEX "TrustState_sourceId_idx" ON "TrustState"("sourceId");

-- CreateIndex
CREATE INDEX "TrustState_targetId_idx" ON "TrustState"("targetId");

-- AddForeignKey
ALTER TABLE "NPC" ADD CONSTRAINT "NPC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustState" ADD CONSTRAINT "TrustState_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustState" ADD CONSTRAINT "TrustState_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEvent" ADD CONSTRAINT "MemoryEvent_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustEvent" ADD CONSTRAINT "TrustEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustEvent" ADD CONSTRAINT "TrustEvent_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "NPC"("id") ON DELETE CASCADE ON UPDATE CASCADE;
