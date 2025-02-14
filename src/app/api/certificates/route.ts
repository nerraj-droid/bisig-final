import { NextResponse } from "next/server";
import { createCertificate, getCertificates } from "@/models/Certificate";

export async function POST(request: Request) {
  const data = await request.json();
  const certificate = await createCertificate(data);
  return NextResponse.json(certificate);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const controlNumber = url.searchParams.get("controlNumber");

  if (controlNumber) {
    const certificates = await getCertificates();
    const certificate = certificates.find((cert) => cert.controlNumber === controlNumber);
    return NextResponse.json(certificate || { error: "Certificate not found" });
  }

  const certificates = await getCertificates();
  return NextResponse.json(certificates);
}
