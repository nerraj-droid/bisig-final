import React from "react";
import Image from "next/image";
import { format } from "date-fns";

interface ModernCertificateTemplateProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
    councilMembers?: string[];
  };
  barangayName: string;
  district?: string;
  city?: string;
  address?: string;
  contactNumber?: string;
  qrCode?: string;
  controlNumber: string;
  issuedDate?: Date;
  watermark?: string;
  showWatermark?: boolean;
  showBorder?: boolean;
  showSeal?: boolean;
  logoLeft?: string;
  logoRight?: string;
  signatureUrl?: string;
}

export function ModernCertificateTemplate({
  title,
  subtitle,
  content,
  officials,
  barangayName = "SAMPLE BARANGAY",
  district = "District 1",
  city = "Sample City",
  address = "123 Sample Street, Sample Barangay",
  contactNumber = "02-1234567",
  qrCode,
  controlNumber,
  issuedDate = new Date(),
  watermark = "/bisig-logo.jpg",
  showWatermark = true,
  showBorder = true,
  showSeal = true,
  logoLeft = "/bisig-logo.jpg",
  logoRight = "/bagong-pilipinas.png",
  signatureUrl,
}: ModernCertificateTemplateProps) {
  return (
    <div className="w-[8.5in] h-[11in] p-8 bg-white relative print:page">
      {/* Watermark */}
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="relative w-[80%] h-[80%]">
            <Image
              src={watermark}
              alt="Watermark"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {/* Border */}
      {showBorder && (
        <div className="absolute inset-0 border-[1px] border-gray-300 m-4 pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="flex justify-between items-center mb-2">
          {/* Left Logo */}
          <div className="relative w-24 h-24">
            <Image
              src={logoLeft}
              alt="Barangay Logo"
              width={96}
              height={96}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Header Text */}
          <div className="flex-1 px-4">
            <h1 className="text-[#5c6d41] text-3xl font-bold uppercase tracking-wide">
              BARANGAY {barangayName}
            </h1>
            <p className="text-[#5c6d41] text-xl">{district}, {city}</p>
            <div className="flex items-center justify-center mt-2 text-[#5c6d41] text-sm">
              <span className="inline-block">📍 {address}</span>
              <span className="mx-2">|</span>
              <span className="inline-block">☎ {contactNumber}</span>
            </div>
          </div>

          {/* Right Logo */}
          <div className="relative w-24 h-24">
            <Image
              src={logoRight}
              alt="Government Logo"
              width={96}
              height={96}
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-300 w-full my-4"></div>

        {/* Certificate Title */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold tracking-widest">C E R T I F I C A T I O N</h2>
          {subtitle && <p className="text-lg italic">({subtitle})</p>}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-300 w-full my-4"></div>
      </div>

      {/* Content */}
      <div className="mb-8 px-4">{content}</div>

      {/* Signatures Section */}
      <div className="mt-16 flex justify-between">
        {/* Left side - Council Members */}
        <div className="w-1/3 bg-[#f9f9e0] p-4 rounded-sm border-t-4 border-[#5c6d41]">
          <h3 className="font-bold text-[#5c6d41] mb-2 text-center">Council Members:</h3>
          <ul className="text-sm space-y-2">
            {officials.councilMembers?.map((member, index) => (
              <li key={index} className="text-[#5c6d41]">{member}</li>
            ))}
            {officials.secretary && (
              <li className="text-[#5c6d41] font-semibold mt-4">
                {officials.secretary}
                <div className="text-xs">Secretary</div>
              </li>
            )}
            {officials.treasurer && (
              <li className="text-[#5c6d41] font-semibold">
                {officials.treasurer}
                <div className="text-xs">Treasurer</div>
              </li>
            )}
          </ul>
        </div>

        {/* Right side - Punong Barangay Signature */}
        <div className="w-1/2 flex flex-col items-center justify-end">
          <div className="w-64 text-center">
            {signatureUrl ? (
              <div className="relative h-20 w-40 mx-auto mb-1">
                <Image
                  src={signatureUrl}
                  alt="Signature"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            ) : (
              <div className="border-b border-black mb-1 h-8"></div>
            )}
            <p className="font-bold text-[#5c6d41]">{officials.punongBarangay}</p>
            <p className="text-sm">Punong Barangay</p>

            {/* Official Seal */}
            {showSeal && (
              <div className="absolute right-12 bottom-24 opacity-50">
                <div className="relative h-24 w-24">
                  <Image
                    src="/bisig-logo.jpg"
                    alt="Official Seal"
                    width={96}
                    height={96}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <p className="text-xs text-center text-red-500 italic">*Not valid w/o official seal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8 text-xs text-gray-600">
        <div className="flex justify-between items-end">
          <div>
            <p>Control No: {controlNumber}</p>
            <p>Issued On: {format(issuedDate, "MM-dd-yyyy")}</p>
            <p>CTC#: {Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}</p>
            <p>O.R. #: {Math.floor(Math.random() * 1000).toString()}</p>
          </div>
          {qrCode && (
            <div className="relative w-16 h-16">
              <Image
                src={qrCode}
                alt="QR Code"
                width={64}
                height={64}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 