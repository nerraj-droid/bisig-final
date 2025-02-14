import React from "react";
import { CertificateTemplate } from "../CertificateTemplate";
import { format } from "date-fns";

interface BarangayClearanceProps {
  residentName: string;
  address: string;
  purpose: string;
  controlNumber: string;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
  };
  qrCode?: string;
  issuedDate?: Date;
}

export function BarangayClearance({
  residentName,
  address,
  purpose,
  controlNumber,
  officials,
  qrCode,
  issuedDate = new Date(),
}: BarangayClearanceProps) {
  const content = (
    <div className="space-y-6">
      <p>TO WHOM IT MAY CONCERN:</p>

      <p className="text-justify">
        This is to certify that <span className="font-bold">{residentName}</span>, of legal age, Filipino, and a
        resident of <span className="font-bold">{address}</span> is a person of good moral character and law-abiding
        citizen in our community.
      </p>

      <p className="text-justify">
        This certification is being issued upon the request of the above-named person for{" "}
        <span className="font-bold">{purpose}</span>.
      </p>

      <p>
        Issued this {format(issuedDate, "do")} day of {format(issuedDate, "MMMM yyyy")} at Barangay [BARANGAY NAME],
        [MUNICIPALITY], [PROVINCE].
      </p>
    </div>
  );

  return (
    <CertificateTemplate
      title="BARANGAY CLEARANCE"
      content={content}
      officials={officials}
      qrCode={qrCode}
      controlNumber={controlNumber}
    />
  );
}
