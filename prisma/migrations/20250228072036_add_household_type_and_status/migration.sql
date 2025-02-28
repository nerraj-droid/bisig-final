-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "test";

-- CreateEnum
CREATE TYPE "public"."HouseholdType" AS ENUM ('SINGLE_FAMILY', 'MULTI_FAMILY', 'EXTENDED_FAMILY', 'SINGLE_PERSON', 'NON_FAMILY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."HouseholdStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RELOCATED', 'MERGED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."Household" ADD COLUMN     "history" JSONB[],
ADD COLUMN     "mergedFrom" TEXT[],
ADD COLUMN     "mergedInto" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "public"."HouseholdStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "type" "public"."HouseholdType" NOT NULL DEFAULT 'SINGLE_FAMILY';
