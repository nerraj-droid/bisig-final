-- CreateTable
CREATE TABLE "Officials" (
    "id" TEXT NOT NULL,
    "punongBarangay" TEXT NOT NULL,
    "secretary" TEXT,
    "treasurer" TEXT,

    CONSTRAINT "Officials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "controlNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3),
    "officialId" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "Officials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
