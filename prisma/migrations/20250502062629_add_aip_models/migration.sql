-- CreateEnum
CREATE TYPE "public"."AIPStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "public"."MilestoneStatus" AS ENUM ('PENDING', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."AnnualInvestmentProgram" (
    "id" TEXT NOT NULL,
    "fiscalYearId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."AIPStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "approvedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,

    CONSTRAINT "AnnualInvestmentProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIPProject" (
    "id" TEXT NOT NULL,
    "aipId" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "location" TEXT,
    "expectedBeneficiaries" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "budgetCategoryId" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fundSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIPProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIPMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "public"."MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIPMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIPExpense" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIPExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AIPAttachment" (
    "id" TEXT NOT NULL,
    "aipId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "filetype" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "AIPAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AnnualInvestmentProgram" ADD CONSTRAINT "AnnualInvestmentProgram_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "public"."FiscalYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnualInvestmentProgram" ADD CONSTRAINT "AnnualInvestmentProgram_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnualInvestmentProgram" ADD CONSTRAINT "AnnualInvestmentProgram_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPProject" ADD CONSTRAINT "AIPProject_aipId_fkey" FOREIGN KEY ("aipId") REFERENCES "public"."AnnualInvestmentProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPProject" ADD CONSTRAINT "AIPProject_budgetCategoryId_fkey" FOREIGN KEY ("budgetCategoryId") REFERENCES "public"."BudgetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPMilestone" ADD CONSTRAINT "AIPMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."AIPProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPExpense" ADD CONSTRAINT "AIPExpense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."AIPProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPExpense" ADD CONSTRAINT "AIPExpense_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPAttachment" ADD CONSTRAINT "AIPAttachment_aipId_fkey" FOREIGN KEY ("aipId") REFERENCES "public"."AnnualInvestmentProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPAttachment" ADD CONSTRAINT "AIPAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
