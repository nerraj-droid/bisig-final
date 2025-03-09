interface BarangayInfo {
  barangayName: string;
  district: string;
  city: string;
  province: string;
  barangayAddress: string;
  contactNumber: string;
  email: string;
  website: string;
  logoLeft: string;
  logoRight: string;
}

interface BarangayOfficials {
  punongBarangay: string;
  secretary: string;
  treasurer: string;
  councilMembers: string[];
  signatureUrls: {
    punongBarangay?: string;
    secretary?: string;
    treasurer?: string;
  };
}

export interface TemplateSettings {
  // Barangay Information
  barangayName: string;
  district: string;
  city: string;
  province: string;
  barangayAddress: string;
  contactNumber: string;
  email: string;
  website: string;
  logoLeft: string;
  logoRight: string;
  
  // Officials Information
  officials: {
    punongBarangay: string;
    secretary: string;
    treasurer: string;
    councilMembers: string[];
  };
  signatureUrls: {
    punongBarangay?: string;
    secretary?: string;
    treasurer?: string;
  };

  // Template Customization
  title?: string;
  showBorder?: boolean;
  borderWidth?: number;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showWatermark?: boolean;
  watermarkUrl?: string;
  watermarkOpacity?: number;
}

export const getTemplateSettings = (): TemplateSettings => {
  // Get barangay info
  const storedInfo = localStorage.getItem("barangayInfo");
  const defaultInfo: BarangayInfo = {
    barangayName: "SAN VICENTE",
    district: "District 4",
    city: "Quezon City",
    province: "Metro Manila",
    barangayAddress: "11-O Maayusin Extn., Brgy. San Vicente, Diliman, Quezon City 1101",
    contactNumber: "02-4415644",
    email: "barangaysanvicente@gmail.com",
    website: "https://sanvicente.gov.ph",
    logoLeft: "/bisig-logo.jpg",
    logoRight: "/bagong-pilipinas.png"
  };
  const barangayInfo: BarangayInfo = storedInfo ? JSON.parse(storedInfo) : defaultInfo;

  // Get officials info
  const storedOfficials = localStorage.getItem("barangayOfficials");
  const defaultOfficials: BarangayOfficials = {
    punongBarangay: "KRISTHINE DEL \"KRIS\" ADRANEDA-ADVINCULA",
    secretary: "AMALIA LIWANAG",
    treasurer: "JOCELYN JIMENEZ",
    councilMembers: [
      "RAUL NARCA",
      "MARIETTA PANABI",
      "WILFREDO REAL",
      "AURORA NOCOM",
      "FLORENCIO BONDOC, JR.",
      "JAMES NOEL ROJO",
      "ROGELIO DE LEON, JR.",
      "JOEL SALAMERO"
    ],
    signatureUrls: {
      punongBarangay: "",
      secretary: "",
      treasurer: ""
    }
  };
  const officials: BarangayOfficials = storedOfficials ? JSON.parse(storedOfficials) : defaultOfficials;

  // Get template customization settings
  const storedTemplateSettings = localStorage.getItem("templateSettings");
  const defaultTemplateSettings = {
    title: "Barangay Certificate",
    showBorder: true,
    borderWidth: 1,
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    showWatermark: false,
    watermarkUrl: "",
    watermarkOpacity: 0.1
  };
  const templateSettings = storedTemplateSettings ? JSON.parse(storedTemplateSettings) : defaultTemplateSettings;

  // Combine all settings
  return {
    ...barangayInfo,
    officials: {
      punongBarangay: officials.punongBarangay,
      secretary: officials.secretary,
      treasurer: officials.treasurer,
      councilMembers: officials.councilMembers
    },
    signatureUrls: officials.signatureUrls,
    ...templateSettings
  };
}; 