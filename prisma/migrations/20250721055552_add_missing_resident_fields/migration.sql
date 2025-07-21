-- AlterTable
ALTER TABLE "public"."Resident" ADD COLUMN     "dateOfDeath" TIMESTAMP(3),
ADD COLUMN     "headOfHousehold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeceased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unemploymentReason" TEXT;
