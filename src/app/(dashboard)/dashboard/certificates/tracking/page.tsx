"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string;
  residentName: string;
  address: string;
  purpose: string;
  controlNumber: string;
  status: string;
  issuedDate?: Date;
}

export default function CertificateTrackingPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      const response = await fetch("/api/certificates");
      const data = await response.json();
      setCertificates(data);
    };

    fetchCertificates();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Certificate Tracking</h1>
      <table className="min-w-full mt-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Resident Name</th>
            <th className="border px-4 py-2">Control Number</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Issued Date</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert) => (
            <tr key={cert.id}>
              <td className="border px-4 py-2">{cert.residentName}</td>
              <td className="border px-4 py-2">{cert.controlNumber}</td>
              <td className="border px-4 py-2">{cert.status}</td>
              <td className="border px-4 py-2">
                {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
