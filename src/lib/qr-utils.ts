import QRCode from "qrcode";

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 128,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
}

export function generateVerificationURL(controlNumber: string): string {
  // Use the base URL from environment or default to localhost
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseURL}/dashboard/certificates/verify?controlNumber=${controlNumber}`;
}

// Generate verification data for QR code
export function generateVerificationData(certificate: {
  controlNumber: string;
  type: string;
  residentName: string;
  issuedDate: string;
}): string {
  return JSON.stringify({
    controlNumber: certificate.controlNumber,
    type: certificate.type,
    residentName: certificate.residentName,
    issuedDate: certificate.issuedDate,
    verifyUrl: generateVerificationURL(certificate.controlNumber)
  });
}
