import React from "react";
import { ModernCertificateTemplate } from "../ModernCertificateTemplate";
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
    councilMembers?: string[];
  };
  qrCode?: string;
  templateSettings?: any;
  civilStatus?: string;
}

export function BarangayClearance({
  residentName,
  address,
  purpose,
  controlNumber,
  officials,
  qrCode,
  templateSettings,
  civilStatus = "Single"
}: BarangayClearanceProps) {
  // Use template settings or fallback to defaults
  const title = templateSettings?.title || "BARANGAY CLEARANCE";
  const subtitle = "Clearance";
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
        <span className="mx-1">{templateSettings?.age ? `${templateSettings.age} years old,` : "of legal age,"}</span>
        <span className="font-medium">{civilStatus}</span>, Filipino, and a resident of{" "}
        <span className="font-bold underline">{address}</span> is a person of good moral character and has
        <span className="font-bold"> NO DEROGATORY RECORD</span> on file in this Barangay.
      </p>

      <p className="text-justify leading-relaxed">
        This CLEARANCE is being issued upon the request of the above-named person on this{" "}
        <span className="font-medium">{format(issuedDate, "do")} day of {format(issuedDate, "MMMM yyyy")}</span> {purposeStatement}.
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
