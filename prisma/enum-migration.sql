-- Add new values to BlotterCaseStatus enum
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'FILED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'DOCKETED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'SUMMONED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'MEDIATION';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'CONCILIATION';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'EXTENDED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'CERTIFIED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
ALTER TYPE "public"."BlotterCaseStatus" ADD VALUE IF NOT EXISTS 'DISMISSED'; 