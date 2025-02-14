import React, { useState } from "react";
import { BusinessPermit } from "../components/certificate-templates/BusinessPermit";

export function BusinessPermitEditor() {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
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
      <h2>Edit Business Permit</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <input type="text" placeholder="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
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
      <BusinessPermit
        businessName={businessName}
        ownerName={ownerName}
        address={address}
        controlNumber={controlNumber}
        officials={officials}
      />
    </div>
  );
}
