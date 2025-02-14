"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { CertificateGenerator } from "../components/CertificateGenerator";

export default function NewCertificatePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  // This would typically come from your form or API
  const sampleData = {
    residentName: "Juan Dela Cruz",
    address: "123 Sample St., Barangay Sample",
    purpose: "Local Employment",
    controlNumber: "BC-" + new Date().getTime(),
    officials: {
      punongBarangay: "Hon. Sample Name",
      secretary: "John Doe",
      treasurer: "Jane Doe",
    },
    businessName: "Sample Business",
    ownerName: "Sample Owner",
  };

  if (!type) {
    return <div>Invalid certificate type</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generate Certificate</h1>
        <p className="text-muted-foreground">Preview and generate the certificate</p>
      </div>

      <CertificateGenerator type={type} data={sampleData} />
    </div>
  );
}
