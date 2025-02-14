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

export function generateVerificationURL(certificateId: string): string {
  // Replace with your actual verification URL
  return `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateId}`;
}
