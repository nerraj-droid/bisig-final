interface Certificate {
  controlNumber: string;
  type: 'clearance' | 'residency' | 'business' | 'indigency';
  residentName: string;
  purpose: string;
  issuedDate: string;
  status: 'valid' | 'expired' | 'revoked';
}

export const storeCertificate = (certificate: Certificate) => {
  const storedCertificates = localStorage.getItem("issuedCertificates");
  const certificates: Certificate[] = storedCertificates ? JSON.parse(storedCertificates) : [];
  
  // Add new certificate
  certificates.push(certificate);
  
  // Store updated list
  localStorage.setItem("issuedCertificates", JSON.stringify(certificates));
};

export const generateControlNumber = () => {
  const storedCertificates = localStorage.getItem("issuedCertificates");
  const certificates: Certificate[] = storedCertificates ? JSON.parse(storedCertificates) : [];
  
  const currentYear = new Date().getFullYear();
  const lastNumber = certificates
    .filter(cert => cert.controlNumber.startsWith(`BRGY-${currentYear}`))
    .length;
  
  const newNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `BRGY-${currentYear}-${newNumber}`;
}; 