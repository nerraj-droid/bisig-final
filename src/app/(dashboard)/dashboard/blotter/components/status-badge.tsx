"use client";

import { BlotterCaseStatus } from "@/lib/enums";

export function StatusBadge({ status }: { status: BlotterCaseStatus }) {
  const statusConfig = {
    [BlotterCaseStatus.PENDING]: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    [BlotterCaseStatus.ONGOING]: { color: "bg-blue-100 text-blue-800", label: "Ongoing" },
    [BlotterCaseStatus.RESOLVED]: { color: "bg-green-100 text-green-800", label: "Resolved" },
    [BlotterCaseStatus.ESCALATED]: { color: "bg-red-100 text-red-800", label: "Escalated" }
  };
  
  const config = statusConfig[status] || statusConfig[BlotterCaseStatus.PENDING];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
} 