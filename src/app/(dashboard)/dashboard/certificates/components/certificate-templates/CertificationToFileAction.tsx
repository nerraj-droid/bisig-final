import React from "react";
import { format } from "date-fns";

interface CFATemplateProps {
  caseNumber: string;
  caseTitle: string;
  complainantName: string;
  respondentName: string;
  incidentDescription: string;
  incidentDate: string;
  certificationDate: string;
  barangayName: string;
  punongBarangay: string;
  controlNumber: string;
  footerText?: string;
}

export default function CertificationToFileAction({
  caseNumber,
  caseTitle,
  complainantName,
  respondentName,
  incidentDescription,
  incidentDate,
  certificationDate,
  barangayName,
  punongBarangay,
  controlNumber,
  footerText = "This is a system-generated certificate.",
}: CFATemplateProps) {
  const formattedCertDate = new Date(certificationDate);
  const formattedIncidentDate = new Date(incidentDate);

  return (
    <div className="certificate-container p-10 max-w-4xl mx-auto bg-white">
      <div className="certificate-header text-center mb-8">
        <div className="flex justify-center items-center mb-2">
          <img src="/barangay-logo.png" alt="Barangay Logo" className="h-16 w-16 mr-2" />
          <div>
            <h1 className="text-xl font-bold">Republic of the Philippines</h1>
            <h2 className="text-lg">City/Municipality of _______________</h2>
            <h2 className="text-lg font-semibold">Barangay {barangayName}</h2>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-6 uppercase">CERTIFICATION TO FILE ACTION</h1>
      </div>

      <div className="certificate-body text-justify space-y-6">
        <p>
          This is to certify that the case entitled <span className="font-semibold">"{caseTitle}"</span> with case number <span className="font-semibold">{caseNumber}</span> between complainant <span className="font-semibold">{complainantName}</span> and respondent <span className="font-semibold">{respondentName}</span> was filed before the Lupong Tagapamayapa of this Barangay.
        </p>

        <p>
          The dispute involves: <span className="font-semibold">{incidentDescription}</span> which occurred on <span className="font-semibold">{format(formattedIncidentDate, "MMMM d, yyyy")}</span>.
        </p>

        <p>
          Despite efforts to conciliate and/or mediate the dispute between the parties, no amicable settlement was reached and no agreement to arbitrate was entered into by the parties.
        </p>

        <p>
          After the lapse of the mediation/conciliation procedure, this certification is issued pursuant to Section 412 of the Local Government Code of 1991 to enable the complainant to file the appropriate action in court.
        </p>

        <p>
          The complainant is hereby allowed to file the appropriate action in the proper court/government office.
        </p>
      </div>

      <div className="certificate-footer mt-10">
        <div className="flex justify-between">
          <div className="left-section">
            <p>Issued on: {format(formattedCertDate, "MMMM d, yyyy")}</p>
            <p>Control No.: {controlNumber}</p>
          </div>
          <div className="right-section text-center w-64">
            <p className="font-bold uppercase">{punongBarangay}</p>
            <p className="border-t border-black pt-1">Punong Barangay</p>
          </div>
        </div>
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>{footerText}</p>
          <p className="mt-1">Verify this certificate at: https://barangay-portal.gov.ph/verify</p>
        </div>
      </div>
    </div>
  );
} 