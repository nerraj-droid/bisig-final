/*
  Warnings:

  - You are about to drop the column `headOfHousehold` on the `Resident` table. All the data in the column will be lost.
  - You are about to drop the column `proofOfIdentity` on the `Resident` table. All the data in the column will be lost.
  - The `employmentStatus` column on the `Resident` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `identityType` column on the `Resident` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."EmploymentStatus" AS ENUM ('EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."IdentityType" AS ENUM ('UMID', 'DRIVERS_LICENSE', 'PASSPORT', 'SSS', 'PHILHEALTH', 'VOTERS_ID', 'POSTAL_ID');

-- AlterTable
ALTER TABLE "public"."Resident" DROP COLUMN "headOfHousehold",
DROP COLUMN "proofOfIdentity",
ADD COLUMN     "identityNumber" TEXT,
DROP COLUMN "employmentStatus",
ADD COLUMN     "employmentStatus" "public"."EmploymentStatus" NOT NULL DEFAULT 'EMPLOYED',
DROP COLUMN "identityType",
ADD COLUMN     "identityType" "public"."IdentityType";
