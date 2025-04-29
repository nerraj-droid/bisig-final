/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BlotterAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `BlotterAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `BlotterAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `BlotterAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `BlotterAttachment` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedById` on the `BlotterAttachment` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `BlotterAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `BlotterAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `BlotterAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `BlotterAttachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BlotterStatusUpdate` table without a default value. This is not possible if the table is not empty.
  - Made the column `notes` on table `BlotterStatusUpdate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'FILED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'DOCKETED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'SUMMONED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'MEDIATION';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'CONCILIATION';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'EXTENDED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'CERTIFIED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'DISMISSED';

-- AlterTable
ALTER TABLE "public"."BlotterAttachment" DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "path",
DROP COLUMN "size",
DROP COLUMN "type",
DROP COLUMN "uploadedById",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."BlotterCase" 
ADD COLUMN IF NOT EXISTS "filingFee" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "filingFeePaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "docketDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "summonDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "mediationStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "mediationEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "conciliationStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "conciliationEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "extensionDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "certificationDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resolutionMethod" TEXT,
ADD COLUMN IF NOT EXISTS "escalatedToEnt" TEXT;

-- AlterTable
ALTER TABLE "public"."BlotterStatusUpdate" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
