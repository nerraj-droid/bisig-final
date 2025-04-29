/*
  Warnings:

  - Made the column `notes` on table `BlotterStatusUpdate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `BlotterStatusUpdate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."BlotterCase" ALTER COLUMN "status" SET DEFAULT 'FILED';

-- AlterTable
ALTER TABLE "public"."BlotterStatusUpdate" ALTER COLUMN "notes" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
