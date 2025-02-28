/*
  Warnings:

  - The values [ADMIN,STAFF,USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `residentName` on the `Certificate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[controlNumber]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `residentId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('RESIDENCY', 'INDIGENCY', 'CLEARANCE', 'BUSINESS_PERMIT');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'CAPTAIN', 'SECRETARY', 'TREASURER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'SECRETARY';
COMMIT;

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "address",
DROP COLUMN "residentName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "residentId" TEXT NOT NULL,
ADD COLUMN     "type" "CertificateType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Resident" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "educationalAttainment" TEXT,
ADD COLUMN     "ethnicGroup" TEXT,
ADD COLUMN     "extensionName" TEXT,
ADD COLUMN     "familyRole" TEXT,
ADD COLUMN     "familySerialNumber" TEXT,
ADD COLUMN     "fatherLastName" TEXT,
ADD COLUMN     "fatherMiddleName" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "headOfHousehold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastVotingParticipationDate" TIMESTAMP(3),
ADD COLUMN     "motherFirstName" TEXT,
ADD COLUMN     "motherMaidenName" TEXT,
ADD COLUMN     "motherMiddleName" TEXT,
ADD COLUMN     "nationality" TEXT NOT NULL DEFAULT 'Filipino',
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "userPhoto" TEXT,
ADD COLUMN     "voterInBarangay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "votersIdNumber" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "role" SET DEFAULT 'SECRETARY';

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_controlNumber_key" ON "Certificate"("controlNumber");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
