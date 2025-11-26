-- AlterTable
ALTER TABLE "Faction" ADD COLUMN     "goals" TEXT DEFAULT 'Survive and expand influence.',
ADD COLUMN     "resources" INTEGER NOT NULL DEFAULT 100;
