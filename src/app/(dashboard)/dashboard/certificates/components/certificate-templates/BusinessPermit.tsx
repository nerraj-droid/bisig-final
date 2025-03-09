import React from "react";
import { ModernCertificateTemplate } from "../ModernCertificateTemplate";
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
    councilMembers?: string[];
  };
  qrCode?: string;
  issuedDate?: Date;
  templateSettings?: any;
  civilStatus?: string;
}

export function BusinessPermit({
  businessName,
  ownerName,
  address,
  controlNumber,
  officials,
  qrCode,
  issuedDate = new Date(),
  templateSettings,
  civilStatus = "Single"
}: BusinessPermitProps) {
  // Use template settings or fallback to defaults
  const title = templateSettings?.title || "BARANGAY BUSINESS PERMIT";
  const subtitle = "Business Permit";
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
  
  // Create the content for the certificate
  const content = (
    <div className="space-y-6">
      <p className="font-semibold text-lg">TO WHOM IT MAY CONCERN:</p>
      
      <div className="border-2 border-[#5c6d41] p-4 bg-[#f9f9e0] rounded-sm">
        <h3 className="text-center font-bold text-lg mb-4 text-[#5c6d41]">BUSINESS INFORMATION</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Business Name:</p>
            <p className="font-bold text-lg underline">{businessName}</p>
          </div>
          <div>
            <p className="font-semibold">Owner:</p>
            <p className="font-bold text-lg underline">{ownerName}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold">Business Address:</p>
            <p className="font-bold underline">{address}</p>
          </div>
        </div>
      </div>
      
      <p className="text-justify leading-relaxed">
        This is to certify that the above-mentioned business is <span className="font-bold">PERMITTED TO OPERATE</span> within 
        the jurisdiction of Barangay {barangayName}, {city} in accordance with Barangay Ordinance No. {templateSettings?.ordinanceNumber || "___"}.
      </p>
      
      <p className="text-justify leading-relaxed">
        This PERMIT is valid from {format(issuedDate, "MMMM dd, yyyy")} to {format(new Date(issuedDate.getFullYear(), 11, 31), "MMMM dd, yyyy")} 
        unless sooner revoked due to violation of existing Barangay and City Ordinances, Rules and Regulations.
      </p>
      
      <p className="text-justify leading-relaxed">
        Issued this {format(issuedDate, "do")} day of {format(issuedDate, "MMMM yyyy")}.
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
