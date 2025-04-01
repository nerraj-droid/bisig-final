"use client";

import { BlotterPriority } from "@/lib/enums";

export function PriorityBadge({ priority }: { priority: BlotterPriority }) {
  const priorityConfig = {
    [BlotterPriority.LOW]: { color: "bg-gray-100 text-gray-800", label: "Low" },
    [BlotterPriority.MEDIUM]: { color: "bg-blue-100 text-blue-800", label: "Medium" },
    [BlotterPriority.HIGH]: { color: "bg-orange-100 text-orange-800", label: "High" },
    [BlotterPriority.URGENT]: { color: "bg-red-100 text-red-800", label: "Urgent" }
  };
  
  const config = priorityConfig[priority] || priorityConfig[BlotterPriority.MEDIUM];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
} 