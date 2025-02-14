"use client";

import React, { useState } from "react";
import { Certificate } from "@/models/Certificate";
export default function VerifyCertificatePage() {
  const [controlNumber, setControlNumber] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const response = await fetch(`/api/certificates?controlNumber=${controlNumber}`);
      if (!response.ok) throw new Error("Certificate not found");
      const data = await response.json();
      setCertificate(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setCertificate(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Verify Certificate</h1>
      <input
        type="text"
        value={controlNumber}
        onChange={(e) => setControlNumber(e.target.value)}
        placeholder="Enter Control Number"
        className="border p-2 mt-4"
      />
      <button onClick={handleVerify} className="bg-blue-500 text-white p-2 mt-2">
        Verify
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {certificate && (
        <div className="mt-4">
          <h2 className="text-xl">Certificate Details</h2>
          <p>Resident Name: {certificate.residentName}</p>
          <p>Address: {certificate.address}</p>
          <p>Purpose: {certificate.purpose}</p>
          <p>Control Number: {certificate.controlNumber}</p>
          <p>Status: {certificate.status}</p>
          <p>Issued Date: {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString() : "N/A"}</p>
        </div>
      )}
    </div>
  );
}
