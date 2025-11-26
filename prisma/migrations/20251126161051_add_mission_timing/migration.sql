-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "startedAt" TIMESTAMP(3);
