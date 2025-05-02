"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Edit, File, Shield, User } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlotterCaseStatus, BlotterPriority, BlotterPartyType } from "@/lib/enums";
import { toast } from "sonner";
import ProcessFlow from "../components/process-flow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import UpdateStatus from "./update-status";

async function getBlotterCaseDetails(id: string) {
  try {
    const response = await fetch(`/api/blotter/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch case details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blotter case details:", error);
    throw error;
  }
}

export default function BlotterCaseDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBlotterCaseDetails(id);
        setCaseData(data);
      } catch (error) {
        console.error("Error loading case details:", error);
        if (error instanceof Error) {
          toast.error(error.message || "Failed to load case details");
        } else {
          toast.error("An unexpected error occurred while loading case details");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!caseData) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Failed to load case details. The case may not exist or you don't have permission to view it.
          </div>
          <div className="mt-4">
            <Link href="/dashboard/blotter">
              <Button variant="outline" className="gap-1">
                <ArrowLeft size={16} />
                Back to Blotter Cases
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  function getStatusBadgeClasses(status: BlotterCaseStatus) {
    switch (status) {
      case BlotterCaseStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case BlotterCaseStatus.ONGOING:
        return "bg-blue-100 text-blue-800";
      case BlotterCaseStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case BlotterCaseStatus.ESCALATED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getPriorityBadgeClasses(priority: BlotterPriority) {
    switch (priority) {
      case BlotterPriority.LOW:
        return "bg-gray-100 text-gray-800";
      case BlotterPriority.MEDIUM:
        return "bg-blue-100 text-blue-800";
      case BlotterPriority.HIGH:
        return "bg-orange-100 text-orange-800";
      case BlotterPriority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Function to handle report generation
  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      toast.info("Generating report...");

      const response = await fetch(`/api/blotter/${id}/report`, { method: 'POST' });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Handle the PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${caseData.caseNumber}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Report generated successfully");
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Function to navigate to edit page
  const handleEditCase = () => {
    router.push(`/dashboard/blotter/edit/${id}`);
  };

  // Function to render the hearings data
  const renderHearings = () => {
    if (!caseData.hearings || caseData.hearings.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">No hearings scheduled yet.</div>
      );
    }

    return (
      <div className="space-y-4">
        {caseData.hearings.map((hearing: any) => (
          <div key={hearing.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <div className="font-medium">
                {format(new Date(hearing.date || hearing.scheduledDate), 'EEEE, MMMM dd, yyyy')}
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                {hearing.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p>{hearing.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{hearing.location}</p>
              </div>
            </div>
            {hearing.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{hearing.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Function to render status updates
  const renderStatusUpdates = () => {
    if (!caseData.statusUpdates || caseData.statusUpdates.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">No status updates yet.</div>
      );
    }

    return (
      <div className="space-y-4">
        {caseData.statusUpdates.map((update: any) => (
          <div key={update.id} className="border-l-2 border-blue-500 pl-4 pb-4">
            <div className="text-sm text-gray-500 mb-1">
              {format(new Date(update.date || update.createdAt), 'MMM dd, yyyy - h:mm a')}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClasses(update.status)}`}>
                {update.status}
              </span>
              <span className="text-sm">by {update.updatedBy || 'System'}</span>
            </div>
            <p className="text-sm">{update.notes}</p>
          </div>
        ))}
      </div>
    );
  };

  // Format party name properly
  const formatPartyName = (party: any) => {
    if (!party) return 'Unknown';

    if (party.firstName && party.lastName) {
      return `${party.firstName} ${party.middleName ? party.middleName + ' ' : ''}${party.lastName}`;
    }

    return party.name || 'Unknown';
  };

  // Get complainant and respondent from parties array if needed
  const getComplainant = () => {
    if (caseData.complainant) return caseData.complainant;

    if (caseData.parties) {
      return caseData.parties.find((p: any) => p.partyType === BlotterPartyType.COMPLAINANT);
    }

    return null;
  };

  const getRespondent = () => {
    if (caseData.respondent) return caseData.respondent;

    if (caseData.parties) {
      return caseData.parties.find((p: any) => p.partyType === BlotterPartyType.RESPONDENT);
    }

    return null;
  };

  // Function to handle status update modal
  const handleOpenStatusUpdate = () => {
    setStatusDialogOpen(true);
  };

  const handleStatusUpdated = async () => {
    setStatusDialogOpen(false);
    try {
      // Reload the case data
      const data = await getBlotterCaseDetails(id);
      setCaseData(data);
      toast.success("Case status updated successfully");
    } catch (error) {
      console.error("Error refreshing case data:", error);
      toast.error("Failed to refresh case data");
    }
  };

  // Function to open payment dialog
  const openPaymentDialog = () => {
    setPaymentDialogOpen(true);
  };

  // Function to handle payment update
  const handleUpdateFilingFee = async () => {
    try {
      setPaymentDialogOpen(false);
      setUpdatingPayment(true);
      toast.info("Updating filing fee status...");

      const response = await fetch(`/api/blotter/${id}/filing-fee`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filingFeePaid: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update filing fee status');
      }

      // Reload the case data
      const data = await getBlotterCaseDetails(id);
      setCaseData(data);
      toast.success("Filing fee marked as paid");
    } catch (error) {
      console.error('Error updating filing fee status:', error);
      toast.error("Failed to update filing fee status");
    } finally {
      setUpdatingPayment(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/blotter">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{caseData.caseNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(caseData.status)}`}>
              {caseData.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClasses(caseData.priority)}`}>
              {caseData.priority} Priority
            </span>
          </div>
          <div className="flex-1"></div>
          <div className="flex gap-2 flex-wrap">
            {!caseData.filingFeePaid ? (
              <Button
                variant="outline"
                className="gap-1 border-green-500 text-green-600 hover:bg-green-50"
                onClick={openPaymentDialog}
                disabled={updatingPayment}
              >
                <Shield size={16} />
                {updatingPayment ? "Processing..." : "Mark Fee as Paid"}
              </Button>
            ) : null}
            <Button variant="outline" className="gap-1" onClick={handleEditCase}>
              <Edit size={16} />
              Edit Case
            </Button>
            <Button
              variant="outline"
              className="gap-1"
              onClick={generateReport}
              disabled={generatingReport}
            >
              <File size={16} />
              {generatingReport ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>

        {/* Process flow visualization */}
        <div className="mb-6">
          <ProcessFlow
            currentStatus={caseData.status}
            filingFeePaid={caseData.filingFeePaid}
            docketDate={caseData.docketDate}
            summonDate={caseData.summonDate}
            mediationStartDate={caseData.mediationStartDate}
            conciliationStartDate={caseData.conciliationStartDate}
            extensionDate={caseData.extensionDate}
            certificationDate={caseData.certificationDate}
            resolutionMethod={caseData.resolutionMethod}
          />
        </div>

        {/* Case Summary */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium">Case Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Incident Type</p>
              <p className="font-medium">{caseData.incidentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Report Date</p>
              <p className="font-medium">
                {caseData.reportDate ? format(new Date(caseData.reportDate), 'MMM dd, yyyy') : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Incident Date</p>
              <p className="font-medium">
                {caseData.incidentDate ? format(new Date(caseData.incidentDate), 'MMM dd, yyyy') : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Incident Time</p>
              <p className="font-medium">{caseData.incidentTime || 'Not specified'}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-sm text-gray-500">Incident Location</p>
              <p className="font-medium">{caseData.incidentLocation || 'Not specified'}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-sm text-gray-500">Incident Description</p>
              <p className="text-sm">{caseData.incidentDescription || 'No description provided'}</p>
            </div>
            {caseData.entertainedBy && (
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-sm text-gray-500">Entertained By</p>
                <p className="text-sm">{caseData.entertainedBy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Process Details section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Process Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Filing Fee</p>
              <p>{caseData.filingFee ? `₱${caseData.filingFee.toFixed(2)}` : 'Not set'}</p>
              <p className={`text-sm ${caseData.filingFeePaid ? 'text-green-600' : 'text-red-600'}`}>
                {caseData.filingFeePaid ? 'Paid' : 'Unpaid'}
              </p>
            </div>

            {caseData.docketDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Docket Date</p>
                <p>{new Date(caseData.docketDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.summonDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Summon Date</p>
                <p>{new Date(caseData.summonDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.mediationStartDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Mediation Started</p>
                <p>{new Date(caseData.mediationStartDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.mediationEndDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Mediation Ended</p>
                <p>{new Date(caseData.mediationEndDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.conciliationStartDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Conciliation Started</p>
                <p>{new Date(caseData.conciliationStartDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.conciliationEndDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Conciliation Ended</p>
                <p>{new Date(caseData.conciliationEndDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.extensionDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Extension Date</p>
                <p>{new Date(caseData.extensionDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.certificationDate && (
              <div>
                <p className="text-sm font-medium text-gray-500">Certification Issued</p>
                <p>{new Date(caseData.certificationDate).toLocaleDateString()}</p>
              </div>
            )}

            {caseData.resolutionMethod && (
              <div>
                <p className="text-sm font-medium text-gray-500">Resolution Method</p>
                <p>{caseData.resolutionMethod}</p>
              </div>
            )}

            {caseData.escalatedToEnt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Escalated To</p>
                <p>{caseData.escalatedToEnt}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="parties">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <User size={16} />
              <span>Parties</span>
            </TabsTrigger>
            <TabsTrigger value="hearings" className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Hearings</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Shield size={16} />
              <span>Status Updates</span>
            </TabsTrigger>
          </TabsList>

          {/* Parties Tab */}
          <TabsContent value="parties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Complainant */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="text-lg font-medium">Complainant</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {formatPartyName(getComplainant())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{getComplainant()?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Information</p>
                    <p className="font-medium">{getComplainant()?.contactNumber}</p>
                    <p className="text-sm">{getComplainant()?.email}</p>
                  </div>
                  {getComplainant()?.isResident && (
                    <div className="flex items-center text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Registered Resident</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Respondent */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="text-lg font-medium">Respondent</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {formatPartyName(getRespondent())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{getRespondent()?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Information</p>
                    <p className="font-medium">{getRespondent()?.contactNumber}</p>
                    <p className="text-sm">{getRespondent()?.email}</p>
                  </div>
                  {getRespondent()?.isResident && (
                    <div className="flex items-center text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Registered Resident</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Hearings Tab */}
          <TabsContent value="hearings">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Scheduled Hearings</h3>
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar size={14} />
                  Schedule Hearing
                </Button>
              </div>
              <div className="p-6">
                {renderHearings()}
              </div>
            </div>
          </TabsContent>

          {/* Status Updates Tab */}
          <TabsContent value="status">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Status History</h3>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleOpenStatusUpdate}>
                  <Edit size={14} />
                  Update Status
                </Button>
              </div>
              <div className="p-6">
                {renderStatusUpdates()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add the payment confirmation dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              {caseData.status === BlotterCaseStatus.FILED || caseData.status === "FILED" ? (
                "Are you sure you want to mark the filing fee as paid? This will move the case to the DOCKETED status."
              ) : (
                "Are you sure you want to mark the filing fee as paid? The case status will remain as " + caseData.status + "."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="default"
              onClick={handleUpdateFilingFee}
              disabled={updatingPayment}
              className="gap-2"
            >
              <Shield size={16} />
              {updatingPayment ? "Processing..." : "Yes, Mark as Paid"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status update dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Update Case Status</DialogTitle>
            <DialogDescription>
              Change the status and provide details for this update
            </DialogDescription>
          </DialogHeader>
          <UpdateStatus
            caseId={id}
            currentStatus={caseData?.status || BlotterCaseStatus.FILED}
            onStatusUpdated={handleStatusUpdated}
          />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
} 