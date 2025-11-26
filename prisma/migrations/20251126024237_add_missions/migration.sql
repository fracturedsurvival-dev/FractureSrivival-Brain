/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `NPC` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "NPC" ADD COLUMN     "actionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "currentAction" TEXT,
ADD COLUMN     "habits" JSONB DEFAULT '[]',
ADD COLUMN     "skills" JSONB DEFAULT '{}',
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rewards" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NPC_userId_key" ON "NPC"("userId");

-- AddForeignKey
ALTER TABLE "NPC" ADD CONSTRAINT "NPC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "NPC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "NPC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
