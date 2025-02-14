import React, { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { generatePDF } from "@/lib/pdf-utils";
import { generateQRCode, generateVerificationURL } from "@/lib/qr-utils";
import { BarangayClearance } from "./certificate-templates/BarangayClearance";
import { CertificateOfResidency } from "./certificate-templates/CertificateOfResidency";
import { BusinessPermit } from "./certificate-templates/BusinessPermit";
import { IndigencyCertificate } from "./certificate-templates/IndigencyCertificate";

interface CertificateGeneratorProps {
  type: string;
  data: {
    residentName: string;
    address: string;
    purpose: string;
    controlNumber: string;
    officials: {
      punongBarangay: string;
      secretary?: string;
      treasurer?: string;
    };
    businessName: string;
    ownerName: string;
  };
}

export function CertificateGenerator({ type, data }: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = React.useState<string>();

  React.useEffect(() => {
    const generateQR = async () => {
      const verificationUrl = generateVerificationURL(data.controlNumber);
      const qrDataUrl = await generateQRCode(verificationUrl);
      setQrCode(qrDataUrl);
    };

    generateQR();
  }, [data.controlNumber]);

  const handleDownload = useCallback(async () => {
    if (!certificateRef.current) return;

    try {
      await generatePDF("certificate-container", `${type}-${data.controlNumber}.pdf`);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      // Handle error (show toast notification, etc.)
    }
  }, [type, data.controlNumber]);

  const handlePrint = useCallback(() => {
    if (certificateRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Certificate</title>
              <style>
                body { margin: 0; padding: 20px; }
                @media print {
                  body { -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${certificateRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }, [certificateRef]);

  return (
    <div className="space-y-4">
      <div id="certificate-container" ref={certificateRef}>
        {type === "clearance" && <BarangayClearance {...data} qrCode={qrCode} />}
        {type === "residency" && <CertificateOfResidency {...data} qrCode={qrCode} />}
        {type === "business" && (
          <BusinessPermit {...data} qrCode={qrCode} businessName={data.businessName} ownerName={data.ownerName} />
        )}
        {type === "indigency" && <IndigencyCertificate {...data} qrCode={qrCode} />}
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={handleDownload}>Download PDF</Button>
        <Button onClick={handlePrint}>Print Certificate</Button>
      </div>
    </div>
  );
}
