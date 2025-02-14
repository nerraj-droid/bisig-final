import React, { useState } from "react";
import { CertificateOfResidency } from "../components/certificate-templates/CertificateOfResidency";

export function CertificateOfResidencyEditor() {
  const [residentName, setResidentName] = useState("");
  const [address, setAddress] = useState("");
  const [controlNumber, setControlNumber] = useState("");
  const [officials, setOfficials] = useState({
    punongBarangay: "",
    secretary: "",
    treasurer: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div>
      <h2>Edit Certificate of Residency</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Resident Name"
          value={residentName}
          onChange={(e) => setResidentName(e.target.value)}
        />
        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input
          type="text"
          placeholder="Control Number"
          value={controlNumber}
          onChange={(e) => setControlNumber(e.target.value)}
        />
        {/* Add fields for officials */}
        <button type="submit">Save Changes</button>
      </form>
      <CertificateOfResidency
        residentName={residentName}
        address={address}
        controlNumber={controlNumber}
        officials={officials}
      />
    </div>
  );
}
