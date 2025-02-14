import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CertificateTrackingPage from "./tracking/page";
import Link from "next/link";

export default function CertificatesPage() {
  const certificateTypes = [
    {
      title: "Barangay Clearance",
      description: "General purpose clearance for residents",
      href: "/dashboard/certificates/new?type=clearance",
      editHref: "/dashboard/certificates/edit/barangay-clearance",
    },
    {
      title: "Certificate of Residency",
      description: "Proof of residency in the barangay",
      href: "/dashboard/certificates/new?type=residency",
      editHref: "/dashboard/certificates/edit/certificate-of-residency",
    },
    {
      title: "Business Permit",
      description: "Permit for business operations",
      href: "/dashboard/certificates/new?type=business",
      editHref: "/dashboard/certificates/edit/business-permit",
    },
    // {
    //   title: "Indigency Certificate",
    //   description: "Certification for indigent residents",
    //   href: "/dashboard/certificates/new?type=indigency",
    //   editHref: "/dashboard/certificates/edit/indigency-certificate",
    // },
  ];

  return (
    <div className="flex flex-col">
      <CertificateTrackingPage />
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">Create and manage barangay certificates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {certificateTypes.map((cert) => (
            <Card key={cert.title}>
              <CardHeader>
                <CardTitle>{cert.title}</CardTitle>
                <CardDescription>{cert.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={cert.href}>View Template</Link>
                </Button>
                <Button asChild className="w-full mt-2">
                  <Link href={cert.editHref}>Edit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
