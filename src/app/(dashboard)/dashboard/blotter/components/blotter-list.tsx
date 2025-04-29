"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Plus } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { BlotterCaseStatus, BlotterPriority } from "@/lib/enums";
import { type FormattedCase } from "../actions";

interface BlotterListProps {
  cases: FormattedCase[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchTerm?: string;
  status?: BlotterCaseStatus;
  priority?: BlotterPriority;
}

export default function BlotterList({
  cases,
  totalCount,
  currentPage,
  totalPages,
  searchTerm,
  status,
  priority
}: BlotterListProps) {
  return (
    <>
      {cases.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Case #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Incident</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Reported</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Complainant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Respondent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium">{caseItem.caseNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium">{caseItem.incidentType}</span>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {caseItem.incidentLocation}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span>{format(new Date(caseItem.reportDate), 'MMM d, yyyy')}</span>
                      <p className="text-xs text-gray-500">
                        by {caseItem.createdBy}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="truncate max-w-[120px] inline-block">
                      {caseItem.complainant}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="truncate max-w-[120px] inline-block">
                      {caseItem.respondent}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={caseItem.status} />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={caseItem.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/blotter/${caseItem.id}`}>
                          View Details
                        </Link>
                      </Button>
                      
                      {(caseItem.status === 'ESCALATED' || caseItem.status === 'CERTIFIED') && (
                        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white flex items-center">
                          <Link href={`/dashboard/certificates/new/cfa?caseId=${caseItem.id}`}>
                            <FileText className="h-3.5 w-3.5 mr-1" /> Generate CFA
                          </Link>
                        </Button>
                      )}
                      
                      {caseItem.status !== 'ESCALATED' && caseItem.status !== 'CERTIFIED' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 cursor-not-allowed"
                          title="Case must be escalated or certified to generate CFA"
                          disabled
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" /> Generate CFA
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No cases found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm 
              ? "No cases match your search criteria. Try adjusting your filters."
              : "There are no blotter cases recorded yet."}
          </p>
          <div className="mt-6">
            <Link href="/dashboard/blotter/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Blotter Entry
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-1">
            <Link 
              href={`/dashboard/blotter?page=${Math.max(1, currentPage - 1)}${status ? `&status=${status}` : ''}${priority ? `&priority=${priority}` : ''}${searchTerm ? `&q=${searchTerm}` : ''}`}
              aria-disabled={currentPage === 1}
            >
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
            </Link>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3
                ? i + 1
                : currentPage + i - 2;
              
              if (pageNum > totalPages || pageNum < 1) return null;
              
              return (
                <Link 
                  key={pageNum}
                  href={`/dashboard/blotter?page=${pageNum}${status ? `&status=${status}` : ''}${priority ? `&priority=${priority}` : ''}${searchTerm ? `&q=${searchTerm}` : ''}`}
                >
                  <Button 
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
            
            <Link 
              href={`/dashboard/blotter?page=${Math.min(totalPages, currentPage + 1)}${status ? `&status=${status}` : ''}${priority ? `&priority=${priority}` : ''}${searchTerm ? `&q=${searchTerm}` : ''}`}
              aria-disabled={currentPage === totalPages}
            >
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
} 