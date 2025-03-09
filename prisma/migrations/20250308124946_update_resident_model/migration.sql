/*
  Warnings:

  - You are about to drop the column `familyRole` on the `Resident` table. All the data in the column will be lost.
  - You are about to drop the column `familySerialNumber` on the `Resident` table. All the data in the column will be lost.
  - You are about to drop the column `lastVotingParticipationDate` on the `Resident` table. All the data in the column will be lost.
  - You are about to drop the column `votersIdNumber` on the `Resident` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Resident" DROP COLUMN "familyRole",
DROP COLUMN "familySerialNumber",
DROP COLUMN "lastVotingParticipationDate",
DROP COLUMN "votersIdNumber",
ADD COLUMN     "employmentStatus" TEXT,
ADD COLUMN     "identityType" TEXT,
ADD COLUMN     "proofOfIdentity" TEXT,
ADD COLUMN     "sectors" TEXT[];

-- CreateTable
CREATE TABLE "public"."HouseholdStatistic" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "totalResidents" INTEGER NOT NULL,
    "voterCount" INTEGER NOT NULL,
    "seniorCount" INTEGER NOT NULL,
    "minorCount" INTEGER NOT NULL,
    "employedCount" INTEGER NOT NULL,

    CONSTRAINT "HouseholdStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdStatistic_householdId_key" ON "public"."HouseholdStatistic"("householdId");

-- AddForeignKey
ALTER TABLE "public"."HouseholdStatistic" ADD CONSTRAINT "HouseholdStatistic_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
