-- CreateEnum
CREATE TYPE "public"."BlotterCaseStatus" AS ENUM ('PENDING', 'ONGOING', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "public"."BlotterPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."BlotterPartyType" AS ENUM ('COMPLAINANT', 'RESPONDENT', 'WITNESS');

-- CreateEnum
CREATE TYPE "public"."HearingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateTable
CREATE TABLE "public"."BlotterCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "incidentTime" TEXT,
    "incidentLocation" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "incidentDescription" TEXT NOT NULL,
    "status" "public"."BlotterCaseStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."BlotterPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "BlotterCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlotterParty" (
    "id" TEXT NOT NULL,
    "blotterCaseId" TEXT NOT NULL,
    "residentId" TEXT,
    "partyType" "public"."BlotterPartyType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT,
    "email" TEXT,
    "isResident" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlotterParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlotterHearing" (
    "id" TEXT NOT NULL,
    "blotterCaseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "public"."HearingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "minutesNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlotterHearing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlotterStatusUpdate" (
    "id" TEXT NOT NULL,
    "blotterCaseId" TEXT NOT NULL,
    "status" "public"."BlotterCaseStatus" NOT NULL,
    "notes" TEXT,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlotterStatusUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlotterAttachment" (
    "id" TEXT NOT NULL,
    "blotterCaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlotterAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlotterCase_caseNumber_key" ON "public"."BlotterCase"("caseNumber");

-- AddForeignKey
ALTER TABLE "public"."BlotterParty" ADD CONSTRAINT "BlotterParty_blotterCaseId_fkey" FOREIGN KEY ("blotterCaseId") REFERENCES "public"."BlotterCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlotterParty" ADD CONSTRAINT "BlotterParty_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "public"."Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlotterHearing" ADD CONSTRAINT "BlotterHearing_blotterCaseId_fkey" FOREIGN KEY ("blotterCaseId") REFERENCES "public"."BlotterCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlotterStatusUpdate" ADD CONSTRAINT "BlotterStatusUpdate_blotterCaseId_fkey" FOREIGN KEY ("blotterCaseId") REFERENCES "public"."BlotterCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlotterAttachment" ADD CONSTRAINT "BlotterAttachment_blotterCaseId_fkey" FOREIGN KEY ("blotterCaseId") REFERENCES "public"."BlotterCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
