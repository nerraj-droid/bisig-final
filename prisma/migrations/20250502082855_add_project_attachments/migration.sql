-- CreateTable
CREATE TABLE "public"."AIPProjectAttachment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "filetype" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "AIPProjectAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AIPProjectAttachment" ADD CONSTRAINT "AIPProjectAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."AIPProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIPProjectAttachment" ADD CONSTRAINT "AIPProjectAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
