import React from "react";

interface CertificateOfResidencyProps {
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
  qrCode?: string;
  templateSettings?: any;
  civilStatus: string;
}

export function CertificateOfResidency({
  residentName,
  address,
  purpose,
  controlNumber,
  officials,
  qrCode,
  templateSettings,
  civilStatus
}: CertificateOfResidencyProps) {
  // Common styles for better PDF rendering
  const styles = {
    certificate: {
      fontFamily: 'Arial, sans-serif',
      color: '#000',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as 'column',
    },
    header: {
      textAlign: 'center' as 'center',
      marginBottom: '20px',
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '4px',
      textTransform: 'uppercase' as 'uppercase',
    },
    headerSubtitle: {
      fontSize: '14px',
      marginBottom: '4px',
    },
    headerAddress: {
      fontSize: '12px',
      marginBottom: '10px',
    },
    logo: {
      height: '70px',
      marginBottom: '10px',
    },
    title: {
      textAlign: 'center' as 'center',
      fontSize: '22px',
      fontWeight: 'bold',
      marginTop: '30px',
      marginBottom: '30px',
      textTransform: 'uppercase' as 'uppercase',
    },
    content: {
      fontSize: '14px',
      lineHeight: '1.5',
      textAlign: 'justify' as 'justify',
      margin: '20px 0',
    },
    signatureSection: {
      marginTop: '60px',
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '20%',
    },
    signatureBlock: {
      textAlign: 'center' as 'center',
      width: '200px',
    },
    signatureName: {
      fontWeight: 'bold',
      fontSize: '14px',
      borderTop: '1px solid #000',
      paddingTop: '5px',
      marginTop: '40px',
    },
    signatureTitle: {
      fontSize: '12px',
    },
    footer: {
      marginTop: 'auto',
      fontSize: '12px',
      borderTop: '1px solid #ccc',
      paddingTop: '10px',
    },
    qrCode: {
      width: '80px',
      height: '80px',
      position: 'absolute' as 'absolute',
      bottom: '40px',
      right: '20px',
    },
    controlNumber: {
      fontSize: '10px',
      position: 'absolute' as 'absolute',
      bottom: '40px',
      left: '10px',
    },
    underlined: {
      fontWeight: 'bold',
      textDecoration: 'underline',
    }
  };

  const barangayInfo = templateSettings || {};
  const barangayName = barangayInfo.barangayName || "SAN VICENTE";
  const district = barangayInfo.district || "District 4";
  const city = barangayInfo.city || "Quezon City";
  const barangayAddress = barangayInfo.barangayAddress || "Sample Address, Quezon City";
  const contactNumber = barangayInfo.contactNumber || "Tel No. 123-4567";
  const yearsOfResidency = barangayInfo.yearsOfResidency || "6 months";
  const age = barangayInfo.age || "of legal age";

  // Format the current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={styles.certificate}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '80px', textAlign: 'center' }}>
          {templateSettings?.logoUrl ? (
            <img src={templateSettings.logoUrl} alt="Barangay Logo" style={styles.logo} />
          ) : (
            <div style={{ ...styles.logo, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>Logo</span>
            </div>
          )}
        </div>

        <div style={styles.header}>
          <div style={styles.headerTitle}>BARANGAY {barangayName}</div>
          <div style={styles.headerSubtitle}>{district}, {city}</div>
          <div style={styles.headerAddress}>{barangayAddress}</div>
          <div style={styles.headerAddress}>{contactNumber}</div>
        </div>

        <div style={{ width: '80px', textAlign: 'center' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Coat_of_arms_of_the_Philippines.svg/1200px-Coat_of_arms_of_the_Philippines.svg.png"
            alt="Philippine Seal"
            style={styles.logo}
          />
        </div>
      </div>

      {/* Title */}
      <div style={styles.title}>
        CERTIFICATE OF RESIDENCY
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={{ marginBottom: '20px' }}>TO WHOM IT MAY CONCERN:</p>

        <p style={{ textIndent: '40px' }}>
          This is to certify that <span style={styles.underlined}>{residentName}</span>, {age}, {civilStatus}, has been a <strong>resident</strong> of/at{" "}
          <span style={styles.underlined}>{address}</span> this Barangay since <span style={styles.underlined}>{yearsOfResidency}</span> or for about <span style={styles.underlined}>{yearsOfResidency}</span>.
        </p>

        <p style={{ textIndent: '40px', marginTop: '20px' }}>
          This CERTIFICATION is being issued upon the request of the above-named person on this {formattedDate} for the purpose of {purpose || "whatever legal purpose it may serve"}.
        </p>
      </div>

      {/* Flexible spacer */}
      <div style={{ flexGrow: 1, minHeight: '150px' }}></div>

      {/* Council Members and Signature Section */}
      <div style={{ display: 'flex', marginBottom: '120px', position: 'relative' }}>
        {/* Council Members on left */}
        <div style={{
          width: '40%',
          padding: '10px',
          backgroundColor: '#f8f8f8',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Council Members:</div>
          {officials.secretary && <div style={{ fontSize: '12px' }}>{officials.secretary}</div>}
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>Secretary</div>

          {officials.treasurer && <div style={{ fontSize: '12px' }}>{officials.treasurer}</div>}
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>Treasurer</div>

          {templateSettings?.councilMembers && templateSettings.councilMembers.slice(0, 6).map((member: string, index: number) => (
            <div key={index} style={{ fontSize: '11px', marginBottom: '2px' }}>{member}</div>
          ))}
        </div>

        {/* Signature Block on right */}
        <div style={{ width: '60%', display: 'flex', justifyContent: 'center', paddingBottom: '30px' }}>
          <div style={styles.signatureBlock}>
            <div style={styles.signatureName}>{officials.punongBarangay || "HON. SAMPLE NAME"}</div>
            <div style={styles.signatureTitle}>Punong Barangay</div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {qrCode && templateSettings?.showQRCode !== false && (
        <div style={styles.qrCode}>
          <img src={qrCode} alt="Verification QR Code" style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Control Number */}
      <div style={styles.controlNumber}>
        Control No: {controlNumber}<br />
        Issued On: {today.toLocaleDateString()}<br />
        Valid Until: {new Date(today.setMonth(today.getMonth() + 6)).toLocaleDateString()}
      </div>
    </div>
  );
}
