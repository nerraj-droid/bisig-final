import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'AI Dashboard | BISIG',
  description: 'Comprehensive AI Dashboard for the Barangay Management System',
};

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
} 