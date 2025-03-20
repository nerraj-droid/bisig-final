import React from "react";
import { ModernCertificateTemplate } from "../ModernCertificateTemplate";
import { format } from "date-fns";

interface CertificateOfResidencyProps {
  residentName: string;
  address: string;
  purpose: string;
  controlNumber: string;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
    councilMembers?: string[];
  };
  qrCode?: string;
  templateSettings?: any;
  civilStatus: string;
}

export function CertificateOfResidency({
  residentName,
  address,
  purpose,
  controlNumber,
  officials,
  qrCode,
  templateSettings,
  civilStatus
}: CertificateOfResidencyProps) {
  // Use template settings or fallback to defaults
  const title = templateSettings?.title || "CERTIFICATE OF RESIDENCY";
  const subtitle = "Residency";
  const barangayName = templateSettings?.barangayName || "SAMPLE";
  const district = templateSettings?.district || "District 1";
  const city = templateSettings?.city || "Sample City";
  const barangayAddress = templateSettings?.barangayAddress || "123 Sample Street, Sample Barangay";
  const contactNumber = templateSettings?.contactNumber || "02-1234567";
  const showWatermark = templateSettings?.showWatermark !== false;
  const showBorder = templateSettings?.showBorder !== false;
  const showSeal = templateSettings?.showSeal !== false;
  const logoLeft = templateSettings?.logoLeft || "/bisig-logo.jpg";
  const logoRight = templateSettings?.logoRight || "/bagong-pilipinas.png";
  const signatureUrl = templateSettings?.signatureUrl;
  const issuedDate = new Date();

  // Prepare the purpose statement with proper grammar
  const purposeStatement = purpose
    ? `for the purpose of ${purpose}`
    : "for whatever legal purpose it may serve";

  // Create the content for the certificate
  const content = (
    <div className="space-y-6">
      <p className="font-semibold text-lg">TO WHOM IT MAY CONCERN:</p>

      <p className="text-justify leading-relaxed">
        This is to certify that <span className="font-bold underline">{residentName}</span>,
        <span className="mx-1">{templateSettings?.age ? `${templateSettings.age} years old,` : "(AGE)"}</span>
        <span className="font-medium">{civilStatus}</span>, has been a <span className="font-bold">resident</span> of/at{" "}
        <span className="font-bold underline">{address}</span> this Barangay since
        <span className="mx-1 underline">{templateSettings?.yearsOfResidency || "___"}</span>
        or for about <span className="underline">{templateSettings?.yearsOfResidency || "___"}</span>.
      </p>

      <p className="text-justify leading-relaxed">
        This CERTIFICATION is being issued upon the request of the above-named person on{" "}
        <span className="font-medium">this {format(issuedDate, "do")} day of {format(issuedDate, "MMMM yyyy")}</span> {purposeStatement}.
      </p>
    </div>
  );

  return (
    <ModernCertificateTemplate
      title={title}
      subtitle={subtitle}
      content={content}
      officials={officials}
      barangayName={barangayName}
      district={district}
      city={city}
      address={barangayAddress}
      contactNumber={contactNumber}
      qrCode={qrCode}
      controlNumber={controlNumber}
      issuedDate={issuedDate}
      showWatermark={showWatermark}
      showBorder={showBorder}
      showSeal={showSeal}
      logoLeft={logoLeft}
      logoRight={logoRight}
      signatureUrl={signatureUrl}
    />
  );
}
