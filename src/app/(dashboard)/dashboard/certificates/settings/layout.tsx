import React from "react";

export default function CertificateSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="certificate-settings-layout">
            {children}
        </div>
    );
} 