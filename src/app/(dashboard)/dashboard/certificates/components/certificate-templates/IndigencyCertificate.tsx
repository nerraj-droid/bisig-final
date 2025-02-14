import React from "react";
import { CertificateTemplate } from "../CertificateTemplate";
import { format } from "date-fns";

interface IndigencyCertificateProps {
  residentName: string;
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

export function IndigencyCertificate({
  residentName,
  address,
  controlNumber,
  officials,
  qrCode,
  issuedDate = new Date(),
}: IndigencyCertificateProps) {
  const content = (
    <div className="space-y-6">
      <p>TO WHOM IT MAY CONCERN:</p>
      <p className="text-justify">
        This is to certify that <span className="font-bold">{residentName}</span>, of legal age, Filipino, and a
        resident of <span className="font-bold">{address}</span>, is recognized as an indigent resident of our barangay.
      </p>
      <p>
        Issued this {format(issuedDate, "do")} day of {format(issuedDate, "MMMM yyyy")} at Barangay [BARANGAY NAME],
        [MUNICIPALITY], [PROVINCE].
      </p>
    </div>
  );

  return (
    <CertificateTemplate
      title="INDIGENCY CERTIFICATE"
      content={content}
      officials={officials}
      qrCode={qrCode}
      controlNumber={controlNumber}
    />
  );
}
