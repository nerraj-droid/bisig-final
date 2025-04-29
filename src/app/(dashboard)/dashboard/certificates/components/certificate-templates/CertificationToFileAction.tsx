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

  // Styles for better PDF output
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      color: '#000',
      lineHeight: '1.5',
      position: 'relative' as 'relative',
    },
    header: {
      textAlign: 'center' as 'center', 
      marginBottom: '30px'
    },
    logo: {
      height: '64px',
      width: '64px',
      marginRight: '10px'
    },
    headerText: {
      margin: '0',
      padding: '0'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center' as 'center',
      marginTop: '24px',
      marginBottom: '30px',
      textTransform: 'uppercase' as 'uppercase'
    },
    content: {
      marginBottom: '30px',
      textAlign: 'justify' as 'justify'
    },
    paragraph: {
      marginBottom: '16px'
    },
    emphasis: {
      fontWeight: 'bold'
    },
    signature: {
      marginTop: '60px',
      display: 'flex',
      justifyContent: 'space-between'
    },
    certInfo: {
      textAlign: 'left' as 'left'
    },
    signatureBlock: {
      width: '220px',
      textAlign: 'center' as 'center'
    },
    signatureName: {
      fontWeight: 'bold',
      textTransform: 'uppercase' as 'uppercase',
      marginBottom: '4px'
    },
    signatureTitle: {
      borderTop: '1px solid #000',
      paddingTop: '4px'
    },
    footer: {
      marginTop: '60px',
      textAlign: 'center' as 'center',
      color: '#666',
      fontSize: '12px'
    },
    controlNumber: {
      position: 'absolute' as 'absolute',
      bottom: '10px',
      right: '10px',
      color: '#666',
      fontSize: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px'}}>
          <img src="/barangay-logo.png" alt="Barangay Logo" style={styles.logo} />
          <div>
            <h1 style={{...styles.headerText, fontSize: '18px', fontWeight: 'bold'}}>Republic of the Philippines</h1>
            <h2 style={{...styles.headerText, fontSize: '16px'}}>City/Municipality of _______________</h2>
            <h2 style={{...styles.headerText, fontSize: '16px', fontWeight: 'bold'}}>Barangay {barangayName}</h2>
          </div>
        </div>
        <h1 style={styles.title}>Certification to File Action</h1>
      </div>

      <div style={styles.content}>
        <p style={styles.paragraph}>
          This is to certify that the case entitled <span style={styles.emphasis}>"{caseTitle}"</span> with case number <span style={styles.emphasis}>{caseNumber}</span> between complainant <span style={styles.emphasis}>{complainantName}</span> and respondent <span style={styles.emphasis}>{respondentName}</span> was filed before the Lupong Tagapamayapa of this Barangay.
        </p>

        <p style={styles.paragraph}>
          The dispute involves: <span style={styles.emphasis}>{incidentDescription}</span> which occurred on <span style={styles.emphasis}>{format(formattedIncidentDate, "MMMM d, yyyy")}</span>.
        </p>

        <p style={styles.paragraph}>
          Despite efforts to conciliate and/or mediate the dispute between the parties, no amicable settlement was reached and no agreement to arbitrate was entered into by the parties.
        </p>

        <p style={styles.paragraph}>
          After the lapse of the mediation/conciliation procedure, this certification is issued pursuant to Section 412 of the Local Government Code of 1991 to enable the complainant to file the appropriate action in court.
        </p>

        <p style={styles.paragraph}>
          The complainant is hereby allowed to file the appropriate action in the proper court/government office.
        </p>
      </div>

      <div style={styles.signature}>
        <div style={styles.certInfo}>
          <p>Issued on: {format(formattedCertDate, "MMMM d, yyyy")}</p>
          <p>Control No.: {controlNumber}</p>
        </div>
        <div style={styles.signatureBlock}>
          <p style={styles.signatureName}>{punongBarangay}</p>
          <p style={styles.signatureTitle}>Punong Barangay</p>
        </div>
      </div>
      
      <div style={styles.footer}>
        <p>{footerText}</p>
        <p style={{marginTop: '4px'}}>Verify this certificate at: https://barangay-portal.gov.ph/verify</p>
      </div>
      
      <div style={styles.controlNumber}>
        CFA-{controlNumber}
      </div>
    </div>
  );
} 