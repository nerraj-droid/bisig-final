import React from "react";

interface BusinessPermitProps {
  businessName: string;
  ownerName: string;
  address: string;
  controlNumber: string;
  officials: {
    punongBarangay: string;
    secretary?: string;
    treasurer?: string;
    councilMembers?: string[];
  };
  qrCode?: string;
  issuedDate?: Date;
  templateSettings?: any;
  civilStatus?: string;
}

export function BusinessPermit({
  businessName,
  ownerName,
  address,
  controlNumber,
  officials,
  qrCode,
  issuedDate = new Date(),
  templateSettings,
  civilStatus = "Single"
}: BusinessPermitProps) {
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
    businessInfoBox: {
      border: '2px solid #5c6d41',
      backgroundColor: '#f9f9e0',
      padding: '20px',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    businessInfoTitle: {
      textAlign: 'center' as 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#5c6d41',
    },
    businessInfoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
    },
    businessInfoLabel: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    businessInfoValue: {
      fontSize: '16px',
      fontWeight: 'bold',
      borderBottom: '1px solid #000',
      paddingBottom: '3px',
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
      bottom: '20px',
      right: '20px',
    },
    controlNumber: {
      fontSize: '10px',
      position: 'absolute' as 'absolute',
      bottom: '10px',
      left: '10px',
    },
  };

  const barangayInfo = templateSettings || {};
  const barangayName = barangayInfo.barangayName || "SAN VICENTE";
  const district = barangayInfo.district || "District 4";
  const city = barangayInfo.city || "Quezon City";
  const barangayAddress = barangayInfo.barangayAddress || "Sample Address, Quezon City";
  const contactNumber = barangayInfo.contactNumber || "Tel No. 123-4567";
  const ordinanceNumber = barangayInfo.ordinanceNumber || "2023-001";

  // Format dates
  const formattedIssuedDate = issuedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const expiryDate = new Date(issuedDate);
  expiryDate.setMonth(11);
  expiryDate.setDate(31);
  const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
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
        BARANGAY BUSINESS PERMIT
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={{ marginBottom: '20px' }}>TO WHOM IT MAY CONCERN:</p>

        {/* Business Information Box */}
        <div style={styles.businessInfoBox}>
          <div style={styles.businessInfoTitle}>BUSINESS INFORMATION</div>
          <div style={styles.businessInfoGrid}>
            <div>
              <div style={styles.businessInfoLabel}>Business Name:</div>
              <div style={styles.businessInfoValue}>{businessName}</div>
            </div>
            <div>
              <div style={styles.businessInfoLabel}>Owner:</div>
              <div style={styles.businessInfoValue}>{ownerName}</div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={styles.businessInfoLabel}>Business Address:</div>
              <div style={styles.businessInfoValue}>{address}</div>
            </div>
          </div>
        </div>

        <p style={{ textIndent: '40px' }}>
          This is to certify that the above-mentioned business is <strong>PERMITTED TO OPERATE</strong> within
          the jurisdiction of Barangay {barangayName}, {city} in accordance with Barangay Ordinance No. {ordinanceNumber}.
        </p>

        <p style={{ textIndent: '40px', marginTop: '20px' }}>
          This PERMIT is valid from {formattedIssuedDate} to {formattedExpiryDate} unless sooner revoked due to
          violation of existing Barangay and City Ordinances, Rules and Regulations.
        </p>

        <p style={{ textIndent: '40px', marginTop: '20px' }}>
          Issued this {formattedIssuedDate}.
        </p>
      </div>

      {/* Council Members and Signature Section - Fixed positioning to prevent overlap */}
      <div style={{ display: 'flex', marginTop: '20px', marginBottom: '120px', position: 'relative' }}>
        {/* Council Members on left */}
        <div style={{
          width: '40%',
          padding: '10px',
          backgroundColor: '#f8f8f8',
          // Remove maxHeight and overflow properties for printable version
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

      {/* QR Code - Adjusted position to prevent overlap */}
      {qrCode && templateSettings?.showQRCode !== false && (
        <div style={{
          ...styles.qrCode,
          bottom: '40px'  // Moved up to avoid overlapping with footer
        }}>
          <img src={qrCode} alt="Verification QR Code" style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Control Number - Adjusted position to prevent overlap */}
      <div style={{
        ...styles.controlNumber,
        bottom: '40px'  // Moved up to avoid overlapping with footer
      }}>
        Control No: {controlNumber}<br />
        Issued On: {issuedDate.toLocaleDateString()}<br />
        Valid Until: {expiryDate.toLocaleDateString()}
      </div>

    </div>
  );
}
