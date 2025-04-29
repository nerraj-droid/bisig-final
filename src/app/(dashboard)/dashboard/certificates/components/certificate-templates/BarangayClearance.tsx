import React from "react";

interface BarangayClearanceProps {
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

export function BarangayClearance({
  residentName,
  address,
  purpose,
  controlNumber,
  officials,
  qrCode,
  templateSettings,
  civilStatus,
}: BarangayClearanceProps) {
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
        C E R T I F I C A T I O N
        <div style={{ fontSize: '16px', marginTop: '5px' }}>(Clearance)</div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={{ marginBottom: '20px' }}>TO WHOM IT MAY CONCERN:</p>
        
        <p style={{ textIndent: '40px' }}>
          This is to certify that <strong>{residentName}</strong>, of legal age, {civilStatus}, Filipino, and a resident of <strong>{address}</strong> is a person of good moral character and has NO DEROGATORY RECORD on file in this Barangay.
        </p>
        
        <p style={{ textIndent: '40px', marginTop: '20px' }}>
          This CLEARANCE is being issued upon the request of the above-named person on this {formattedDate} for the purpose of {purpose}.
        </p>
      </div>

      {/* Council Members Section */}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%', padding: '10px', backgroundColor: '#f8f8f8' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Council Members:</div>
          {officials.secretary && <div>{officials.secretary}</div>}
          <div style={{ fontSize: '10px', color: '#666' }}>Secretary</div>
          <br />
          {officials.treasurer && <div>{officials.treasurer}</div>}
          <div style={{ fontSize: '10px', color: '#666' }}>Treasurer</div>
          <br />
          {templateSettings?.councilMembers && templateSettings.councilMembers.map((member: string, index: number) => (
            <div key={index}>{member}</div>
          ))}
        </div>

        {/* Signature Block */}
        <div style={{ width: '60%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '30px' }}>
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
        Valid Until: {new Date(today.setMonth(today.getMonth() + 6)).toLocaleDateString()}<br />
      </div>
    </div>
  );
}
