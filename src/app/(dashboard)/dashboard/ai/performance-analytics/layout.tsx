import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Performance Analytics | AI Tools',
  description: 'Monitor and analyze AI model performance metrics and benchmarks',
};

export default function PerformanceAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 