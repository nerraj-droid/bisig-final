import React from "react";
import { CertificateTemplate } from "../CertificateTemplate";
import { format } from "date-fns";

interface BusinessPermitProps {
  businessName: string;
  ownerName: string;
  address: string;
  controlNumber: string;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
  };
  qrCode?: string;
  issuedDate?: Date;
}

export function BusinessPermit({
  businessName,
  ownerName,
  address,
  controlNumber,
  officials,
  qrCode,
  issuedDate = new Date(),
}: BusinessPermitProps) {
  const content = (
    <div className="space-y-6">
      <p>TO WHOM IT MAY CONCERN:</p>
      <p className="text-justify">
        This is to certify that <span className="font-bold">{businessName}</span>, owned by{" "}
        <span className="font-bold">{ownerName}</span>, located at <span className="font-bold">{address}</span>, is
        permitted to operate in our barangay.
      </p>
      <p>
        Issued this {format(issuedDate, "do")} day of {format(issuedDate, "MMMM yyyy")} at Barangay [BARANGAY NAME],
        [MUNICIPALITY], [PROVINCE].
      </p>
    </div>
  );

  return (
    <CertificateTemplate
      title="BUSINESS PERMIT"
      content={content}
      officials={officials}
      qrCode={qrCode}
      controlNumber={controlNumber}
    />
  );
}
