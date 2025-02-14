import React from "react";
import Image from "next/image";

interface CertificateTemplateProps {
  title: string;
  content: React.ReactNode;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
  };
  qrCode?: string;
  controlNumber: string;
}

export function CertificateTemplate({ title, content, officials, qrCode, controlNumber }: CertificateTemplateProps) {
  return (
    <div className="w-[8.5in] h-[11in] p-8 bg-white border-2 border-gray-200 relative print:page">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4">
          <Image src="/bagong-pilipinas.png" alt="Republic Seal" width={80} height={80} />
          <div>
            <p className="text-sm">Republic of the Philippines</p>
            <p className="text-sm">Province of [Province]</p>
            <p className="text-sm">Municipality of [Municipality]</p>
            <p className="font-bold">BARANGAY [BARANGAY NAME]</p>
          </div>
          <Image src="/bisig-logo.jpg" alt="Barangay Logo" width={80} height={80} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold uppercase">{title}</h1>
      </div>

      {/* Content */}
      <div className="mb-8">{content}</div>

      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Control No: {controlNumber}</p>
            {qrCode && (
              <div className="mt-2">
                <Image src={qrCode} alt="QR Code" width={64} height={64} />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="font-bold uppercase">{officials.punongBarangay}</p>
            <p className="text-sm">Punong Barangay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
