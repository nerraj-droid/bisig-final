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
      councilMembers?: string[];
    };
    businessName: string;
    ownerName: string;
    civilStatus: string;
    templateSettings?: any; // Template customization settings
  };
}

export function CertificateGenerator({ type, data }: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = React.useState<string>();

  React.useEffect(() => {
    const generateQR = async () => {
      // Only generate QR code if it's enabled in template settings
      if (data.templateSettings?.showQRCode === false) {
        setQrCode(undefined);
        return;
      }
      
      const verificationUrl = generateVerificationURL(data.controlNumber);
      const qrDataUrl = await generateQRCode(verificationUrl);
      setQrCode(qrDataUrl);
    };

    generateQR();
  }, [data.controlNumber, data.templateSettings?.showQRCode]);

  const handleDownload = useCallback(async () => {
    if (!certificateRef.current) return;

    try {
      // Use template settings for filename if available
      const filename = data.templateSettings?.title 
        ? `${data.templateSettings.title.toLowerCase().replace(/\s+/g, '-')}-${data.controlNumber}.pdf`
        : `${type}-${data.controlNumber}.pdf`;
        
      await generatePDF("certificate-container", filename);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      // Handle error (show toast notification, etc.)
    }
  }, [type, data.controlNumber, data.templateSettings?.title]);

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

  // Apply template settings to certificate container
  const containerStyle = {
    border: data.templateSettings?.showBorder 
      ? `${data.templateSettings.borderWidth || 1}px solid #000` 
      : 'none',
    padding: `${data.templateSettings?.margins?.top || 20}px ${data.templateSettings?.margins?.right || 20}px ${data.templateSettings?.margins?.bottom || 20}px ${data.templateSettings?.margins?.left || 20}px`,
    position: 'relative' as 'relative',
    backgroundColor: '#fff',
    minHeight: '842px', // A4 height in pixels
    // Set fixed dimensions for A4 paper size (210mm x 297mm at 96 DPI)
    width: '793px', // 210mm at 96 DPI
    height: '1122px', // 297mm at 96 DPI
    margin: '0 auto',
    boxSizing: 'border-box' as 'border-box',
    fontFamily: 'Arial, sans-serif',
    // Use mm units for more accurate printing
    pageBreakInside: 'avoid' as 'avoid',
  };

  // Add watermark if enabled
  const watermarkStyle = data.templateSettings?.showWatermark && data.templateSettings?.watermarkUrl ? {
    backgroundImage: `url(${data.templateSettings.watermarkUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    opacity: data.templateSettings.watermarkOpacity || 0.1,
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as 'none',
  } : {};

  return (
    <div className="space-y-4">
      <div className="pdf-container" style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <div id="certificate-container" ref={certificateRef} style={containerStyle}>
          {/* Watermark */}
          {data.templateSettings?.showWatermark && data.templateSettings?.watermarkUrl && (
            <div style={watermarkStyle}></div>
          )}
          
          {/* Certificate content based on type */}
          {type === "clearance" && (
            <BarangayClearance 
              residentName={data.residentName}
              address={data.address}
              purpose={data.purpose}
              controlNumber={data.controlNumber}
              officials={data.officials}
              qrCode={qrCode} 
              templateSettings={data.templateSettings}
              civilStatus={data.civilStatus}
            />
          )}
          {type === "residency" && (
            <CertificateOfResidency 
              residentName={data.residentName}
              address={data.address}
              purpose={data.purpose}
              controlNumber={data.controlNumber}
              officials={data.officials}
              qrCode={qrCode}
              templateSettings={data.templateSettings}
              civilStatus={data.civilStatus}
            />
          )}
          {type === "business" && (
            <BusinessPermit 
              businessName={data.businessName} 
              ownerName={data.ownerName}
              address={data.address}
              controlNumber={data.controlNumber}
              officials={data.officials}
              qrCode={qrCode} 
              templateSettings={data.templateSettings}
              civilStatus={data.civilStatus}
            />
          )}
          {type === "indigency" && (
            <IndigencyCertificate 
              residentName={data.residentName}
              address={data.address}
              purpose={data.purpose}
              controlNumber={data.controlNumber}
              officials={data.officials}
              qrCode={qrCode}
              templateSettings={data.templateSettings}
              civilStatus={data.civilStatus}
            />
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={handleDownload}>Download PDF</Button>
        <Button onClick={handlePrint}>Print Certificate</Button>
      </div>
    </div>
  );
}
