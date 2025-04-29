"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { BlotterCaseStatus } from "@/lib/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusSchema = z.object({
  status: z.nativeEnum(BlotterCaseStatus),
  remarks: z.string().optional(),
  
  // Filing fee fields
  filingFee: z.number().optional(),
  filingFeePaid: z.boolean().optional(),
  
  // Date fields for various stages
  docketDate: z.date().optional(),
  summonDate: z.date().optional(),
  mediationStartDate: z.date().optional(),
  mediationEndDate: z.date().optional(),
  conciliationStartDate: z.date().optional(),
  conciliationEndDate: z.date().optional(),
  extensionDate: z.date().optional(),
  certificationDate: z.date().optional(),
  
  // Decision point fields
  mediationOutcome: z.enum(['RESOLVED', 'UNRESOLVED']).optional(),
  conciliationOutcome: z.enum(['RESOLVED', 'UNRESOLVED']).optional(),
  
  // Escalation and resolution fields
  resolutionMethod: z.string().optional(),
  escalatedToEnt: z.string().optional(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface UpdateStatusProps {
  caseId: string;
  currentStatus: BlotterCaseStatus;
  onStatusUpdated: () => void;
}

// Helper function to get status label
const getStatusLabel = (status: BlotterCaseStatus): string => {
  const labels: Record<BlotterCaseStatus, string> = {
    [BlotterCaseStatus.FILED]: "Filed (Initial Filing)",
    [BlotterCaseStatus.DOCKETED]: "Received in Docket",
    [BlotterCaseStatus.SUMMONED]: "Respondent Summoned",
    [BlotterCaseStatus.MEDIATION]: "Mediation by Punong Barangay",
    [BlotterCaseStatus.CONCILIATION]: "Conciliation by Lupon",
    [BlotterCaseStatus.EXTENDED]: "15-day Extension",
    [BlotterCaseStatus.RESOLVED]: "Case Resolved",
    [BlotterCaseStatus.CLOSED]: "Case Closed",
    [BlotterCaseStatus.DISMISSED]: "Case Dismissed/Withdrawn",
    [BlotterCaseStatus.ESCALATED]: "Escalated to Court",
    [BlotterCaseStatus.CERTIFIED]: "Certification to File Action (CFA)",
    [BlotterCaseStatus.PENDING]: "Pending (Legacy)",
    [BlotterCaseStatus.ONGOING]: "Ongoing (Legacy)",
  };
  return labels[status] || status;
};

// Get next possible statuses based on current status (following the flowchart)
const getNextPossibleStatuses = (currentStatus: BlotterCaseStatus): BlotterCaseStatus[] => {
  switch (currentStatus) {
    case BlotterCaseStatus.FILED:
      return [BlotterCaseStatus.DOCKETED];
      
    case BlotterCaseStatus.DOCKETED:
      return [BlotterCaseStatus.SUMMONED];
      
    case BlotterCaseStatus.SUMMONED:
      return [BlotterCaseStatus.MEDIATION];
      
    case BlotterCaseStatus.MEDIATION:
      // Decision point - will be handled by mediationOutcome radio
      return [BlotterCaseStatus.MEDIATION]; // Keep same status, decision will change it
      
    case BlotterCaseStatus.CONCILIATION:
      // Decision point - will be handled by conciliationOutcome radio
      return [BlotterCaseStatus.CONCILIATION]; // Keep same status, decision will change it
      
    case BlotterCaseStatus.EXTENDED:
      return [BlotterCaseStatus.CERTIFIED];
      
    case BlotterCaseStatus.CERTIFIED:
      return [BlotterCaseStatus.ESCALATED];
      
    // Terminal statuses
    case BlotterCaseStatus.RESOLVED:
    case BlotterCaseStatus.CLOSED:
    case BlotterCaseStatus.DISMISSED:
    case BlotterCaseStatus.ESCALATED:
      return [BlotterCaseStatus.RESOLVED, BlotterCaseStatus.CLOSED, BlotterCaseStatus.DISMISSED, BlotterCaseStatus.ESCALATED];
      
    // Legacy statuses
    case BlotterCaseStatus.PENDING:
    case BlotterCaseStatus.ONGOING:
      return [
        BlotterCaseStatus.FILED,
        BlotterCaseStatus.DOCKETED,
        BlotterCaseStatus.SUMMONED,
        BlotterCaseStatus.MEDIATION
      ];
      
    default:
      return [currentStatus];
  }
};

export default function UpdateStatus({ caseId, currentStatus, onStatusUpdated }: UpdateStatusProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediationOutcome, setShowMediationOutcome] = useState(false);
  const [showConciliationOutcome, setShowConciliationOutcome] = useState(false);
  const [nextStatus, setNextStatus] = useState<BlotterCaseStatus | null>(null);
  
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: currentStatus,
      remarks: "",
      filingFeePaid: false,
    },
  });
  
  const watchStatus = form.watch("status");
  const watchMediationOutcome = form.watch("mediationOutcome");
  const watchConciliationOutcome = form.watch("conciliationOutcome");
  
  // Handle status change based on decision points
  useEffect(() => {
    if (watchStatus === BlotterCaseStatus.MEDIATION) {
      setShowMediationOutcome(true);
      setShowConciliationOutcome(false);
    } else if (watchStatus === BlotterCaseStatus.CONCILIATION) {
      setShowMediationOutcome(false);
      setShowConciliationOutcome(true);
    } else {
      setShowMediationOutcome(false);
      setShowConciliationOutcome(false);
    }
  }, [watchStatus]);
  
  // Handle decision point outcomes
  useEffect(() => {
    if (watchMediationOutcome === 'RESOLVED') {
      setNextStatus(BlotterCaseStatus.RESOLVED);
    } else if (watchMediationOutcome === 'UNRESOLVED') {
      setNextStatus(BlotterCaseStatus.CONCILIATION);
    }
  }, [watchMediationOutcome]);
  
  useEffect(() => {
    if (watchConciliationOutcome === 'RESOLVED') {
      setNextStatus(BlotterCaseStatus.RESOLVED);
    } else if (watchConciliationOutcome === 'UNRESOLVED') {
      setNextStatus(BlotterCaseStatus.EXTENDED);
    }
  }, [watchConciliationOutcome]);
  
  async function onSubmit(data: StatusFormValues) {
    setIsSubmitting(true);
    
    try {
      // If we have a decision point result, use the next status determined by the decision
      const statusToSubmit = nextStatus || data.status;
      
      const response = await fetch(`/api/blotter/${caseId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: statusToSubmit
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }
      
      toast.success("Case status updated successfully");
      onStatusUpdated();
    } catch (error) {
      console.error("Error updating case status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Helper function to render date picker fields
  const renderDateField = (name: keyof StatusFormValues, label: string, description?: string) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value as Date}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  // Define which fields to show based on status
  function getFieldsForStatus(status: BlotterCaseStatus) {
    switch (status) {
      case BlotterCaseStatus.FILED:
        return (
          <>
            <FormField
              control={form.control}
              name="filingFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Filing Fee (₱)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Standard filing fee is ₱100</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Enter the filing fee amount in PHP</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="filingFeePaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Fee Paid</FormLabel>
                    <FormDescription>
                      Mark if the filing fee has been paid
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case BlotterCaseStatus.DOCKETED:
        return renderDateField("docketDate", "Docket Date", "When was the case entered in the docket");
        
      case BlotterCaseStatus.SUMMONED:
        return renderDateField("summonDate", "Summon Date", "When was the summon issued");
        
      case BlotterCaseStatus.MEDIATION:
        return (
          <>
            {renderDateField("mediationStartDate", "Mediation Start Date")}
            {renderDateField("mediationEndDate", "Mediation End Date (Optional)", "Fill only if mediation is completed")}
            
            {showMediationOutcome && (
              <FormField
                control={form.control}
                name="mediationOutcome"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What happened to the mediation?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="RESOLVED" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Resolved - Case was successfully mediated
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="UNRESOLVED" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Unresolved - Proceed to conciliation
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      This will determine the next step in the process
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        );
        
      case BlotterCaseStatus.CONCILIATION:
        return (
          <>
            {renderDateField("conciliationStartDate", "Conciliation Start Date")}
            {renderDateField("conciliationEndDate", "Conciliation End Date (Optional)", "Fill only if conciliation is completed")}
            
            {showConciliationOutcome && (
              <FormField
                control={form.control}
                name="conciliationOutcome"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What happened to the conciliation?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="RESOLVED" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Resolved - Case was successfully conciliated
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="UNRESOLVED" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Unresolved - Proceed to extension
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      This will determine the next step in the process
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        );
        
      case BlotterCaseStatus.EXTENDED:
        return renderDateField("extensionDate", "Extension Date", "When was the 15-day extension granted");
        
      case BlotterCaseStatus.RESOLVED:
        return (
          <FormField
            control={form.control}
            name="resolutionMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resolution Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AMICABLE">Amicable Settlement</SelectItem>
                    <SelectItem value="ARBITRATION">Arbitration Award</SelectItem>
                    <SelectItem value="CONCILIATION">Conciliation</SelectItem>
                    <SelectItem value="WITHDRAWAL">Complaint Withdrawal</SelectItem>
                    <SelectItem value="OTHER">Other Resolution</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How was the case resolved
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case BlotterCaseStatus.ESCALATED:
        return (
          <FormField
            control={form.control}
            name="escalatedToEnt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Escalated To</FormLabel>
                <FormControl>
                  <Input placeholder="Municipal/City Court" {...field} />
                </FormControl>
                <FormDescription>Where was the case escalated to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
        
      case BlotterCaseStatus.CERTIFIED:
        return renderDateField("certificationDate", "Certification Date", "When was the certification to file action issued");
        
      default:
        return null;
    }
  }
  
  // Process stage descriptions
  const getStageDescription = (status: BlotterCaseStatus) => {
    switch (status) {
      case BlotterCaseStatus.FILED:
        return "Initial filing of complaint with ₱100 fee";
      case BlotterCaseStatus.DOCKETED:
        return "Case is entered into the official docket";
      case BlotterCaseStatus.SUMMONED:
        return "Respondent is notified to appear";
      case BlotterCaseStatus.MEDIATION:
        return "15 days, up to 3 sessions with Punong Barangay";
      case BlotterCaseStatus.CONCILIATION:
        return "15 days, up to 3 sessions with Lupon";
      case BlotterCaseStatus.EXTENDED:
        return "Additional 15 days extension period";
      case BlotterCaseStatus.CERTIFIED:
        return "Certification to File Action (CFA) has been issued";
      case BlotterCaseStatus.RESOLVED:
        return "Case has been successfully settled";
      case BlotterCaseStatus.CLOSED:
        return "Case has been administratively closed";
      case BlotterCaseStatus.DISMISSED:
        return "Case has been dismissed or withdrawn";
      case BlotterCaseStatus.ESCALATED:
        return "Case has been escalated to a higher court";
      default:
        return "";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Case Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Step in Case Process</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select next step" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getNextPossibleStatuses(currentStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {getStageDescription(watchStatus)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {getFieldsForStatus(watchStatus)}
            
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any additional notes about this status update" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-medium">Next step will be:</h3>
              <p className="text-sm text-muted-foreground">
                {watchMediationOutcome === 'RESOLVED' && "Case will be marked as RESOLVED"}
                {watchMediationOutcome === 'UNRESOLVED' && "Case will proceed to CONCILIATION"}
                {watchConciliationOutcome === 'RESOLVED' && "Case will be marked as RESOLVED"}
                {watchConciliationOutcome === 'UNRESOLVED' && "Case will proceed to 15-day EXTENSION"}
                {!watchMediationOutcome && !watchConciliationOutcome && 
                  `Status will be updated to ${getStatusLabel(nextStatus || watchStatus)}`}
              </p>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 