/*
  Warnings:

  - The `employmentStatus` column on the `Resident` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `identityType` column on the `Resident` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Resident" DROP COLUMN "employmentStatus",
ADD COLUMN     "employmentStatus" TEXT DEFAULT 'EMPLOYED',
DROP COLUMN "identityType",
ADD COLUMN     "identityType" TEXT;

-- DropEnum
DROP TYPE "public"."EmploymentStatus";

-- DropEnum
DROP TYPE "public"."IdentityType";
