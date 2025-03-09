import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CertificateTrackingPage from "./tracking/page";
import Link from "next/link";
import { Settings, FileText, Users, MapPin } from "lucide-react";

export default function CertificatesPage() {
  const certificateTypes = [
    {
      title: "Barangay Clearance",
      description: "General purpose clearance for residents",
      href: "/dashboard/certificates/new?type=clearance",
      editHref: "/dashboard/certificates/edit/barangay-clearance",
      icon: <FileText className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
    {
      title: "Certificate of Residency",
      description: "Proof of residency in the barangay",
      href: "/dashboard/certificates/new?type=residency",
      editHref: "/dashboard/certificates/edit/certificate-of-residency",
      icon: <FileText className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
    {
      title: "Business Permit",
      description: "Permit for business operations",
      href: "/dashboard/certificates/new?type=business",
      editHref: "/dashboard/certificates/edit/business-permit",
      icon: <FileText className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
    {
      title: "Indigency Certificate",
      description: "Certification for indigent residents",
      href: "/dashboard/certificates/new?type=indigency",
      editHref: "/dashboard/certificates/edit/indigency-certificate",
      icon: <FileText className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
  ];

  const barangaySettingsCards = [
    {
      title: "Barangay Information",
      description: "Update barangay name, district, city, and contact details",
      href: "/dashboard/certificates/settings/barangay-info",
      icon: <MapPin className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
    {
      title: "Council Members",
      description: "Manage barangay officials and council members",
      href: "/dashboard/certificates/settings/council-members",
      icon: <Users className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
    {
      title: "Certificate Settings",
      description: "Configure global certificate settings and defaults",
      href: "/dashboard/certificates/settings/certificate-defaults",
      icon: <Settings className="h-8 w-8 text-[#006B5E] mb-2" />,
    },
  ];

  return (
    <div className="flex flex-col">
      <CertificateTrackingPage />
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#006B5E]">Certificates</h1>
          <p className="text-muted-foreground">Create and manage barangay certificates</p>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-[#006B5E] flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Certificate Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certificateTypes.map((cert) => (
              <Card key={cert.title} className="border-t-4 border-t-[#006B5E] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex flex-col items-center md:items-start">
                    {cert.icon}
                    <CardTitle className="text-lg">{cert.title}</CardTitle>
                  </div>
                  <CardDescription>{cert.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button asChild className="w-full bg-[#006B5E] hover:bg-[#005046]">
                    <Link href={cert.href}>Generate Certificate</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-[#006B5E] text-[#006B5E] hover:bg-[#e6f0ee]">
                    <Link href={cert.editHref}>Edit Template</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#006B5E] flex items-center">
            <Settings className="mr-2 h-5 w-5" /> Barangay Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {barangaySettingsCards.map((setting) => (
              <Card key={setting.title} className="border-t-4 border-t-[#F39C12] shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex flex-col items-center md:items-start">
                    {setting.icon}
                    <CardTitle className="text-lg">{setting.title}</CardTitle>
                  </div>
                  <CardDescription>{setting.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-[#F39C12] hover:bg-[#E67E22]">
                    <Link href={setting.href}>Manage</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
