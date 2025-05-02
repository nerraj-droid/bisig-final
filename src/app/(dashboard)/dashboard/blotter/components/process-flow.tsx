"use client";

import React from 'react';
import { BlotterCaseStatus } from '@/lib/enums';
import {
  LucideEdit,
  FileText,
  ClipboardList,
  UserCheck,
  UserX,
  MessagesSquare,
  Scale,
  CheckCircle,
  Clock,
  AlertCircle,
  FileOutput,
  UserX2,
  HelpCircle,
  ArrowRight,
  XCircle,
  ArrowDownCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Status mapping to determine which steps are complete
type StatusMap = {
  [key in BlotterCaseStatus]: number;
};

const statusToStepMap: StatusMap = {
  [BlotterCaseStatus.FILED]: 1,
  [BlotterCaseStatus.DOCKETED]: 2,
  [BlotterCaseStatus.SUMMONED]: 3,
  [BlotterCaseStatus.MEDIATION]: 4,
  [BlotterCaseStatus.RESOLVED]: 7,
  [BlotterCaseStatus.CONCILIATION]: 5,
  [BlotterCaseStatus.EXTENDED]: 6,
  [BlotterCaseStatus.CERTIFIED]: 7,
  [BlotterCaseStatus.ESCALATED]: 8,
  [BlotterCaseStatus.CLOSED]: 9,
  [BlotterCaseStatus.DISMISSED]: 9,
  [BlotterCaseStatus.PENDING]: 1,
  [BlotterCaseStatus.ONGOING]: 4,
};

interface ProcessFlowProps {
  currentStatus: BlotterCaseStatus;
  filingFeePaid?: boolean;
  docketDate?: Date | string | null;
  summonDate?: Date | string | null;
  mediationStartDate?: Date | string | null;
  conciliationStartDate?: Date | string | null;
  extensionDate?: Date | string | null;
  certificationDate?: Date | string | null;
  resolutionMethod?: string | null;
}

const ProcessFlow: React.FC<ProcessFlowProps> = ({
  currentStatus,
  filingFeePaid = false,
  docketDate,
  summonDate,
  mediationStartDate,
  conciliationStartDate,
  extensionDate,
  certificationDate,
  resolutionMethod,
}) => {
  // Get current step number (1-based)
  const currentStep = statusToStepMap[currentStatus] || 1;

  // Check if case was resolved at mediation
  const resolvedAtMediation = currentStatus === BlotterCaseStatus.RESOLVED &&
    !conciliationStartDate &&
    mediationStartDate;

  // Check if case was resolved at conciliation
  const resolvedAtConciliation = currentStatus === BlotterCaseStatus.RESOLVED &&
    conciliationStartDate;

  // Define the process steps
  const steps = [
    {
      label: 'File Complaint',
      description: 'P100 Fee',
      icon: <FileText className="w-5 h-5" />,
      completed: currentStep > 1 || filingFeePaid,
      current: currentStep === 1,
      skipped: false,
      tooltip: 'Filing of complaint with ₱100 fee'
    },
    {
      label: 'Receive in Docket',
      description: docketDate ? new Date(docketDate).toLocaleDateString() : '',
      icon: <ClipboardList className="w-5 h-5" />,
      completed: currentStep > 2,
      current: currentStep === 2,
      skipped: false,
      tooltip: 'Case is entered into the official docket'
    },
    {
      label: 'Summon Respondent',
      description: summonDate ? new Date(summonDate).toLocaleDateString() : '',
      icon: <UserCheck className="w-5 h-5" />,
      completed: currentStep > 3,
      current: currentStep === 3,
      skipped: false,
      tooltip: 'Respondent is sent a summons to appear'
    },
    {
      label: 'Mediation',
      description: '15 days, 3 sessions',
      icon: <MessagesSquare className="w-5 h-5" />,
      completed: currentStep > 4 || currentStatus === BlotterCaseStatus.RESOLVED,
      current: currentStep === 4,
      skipped: currentStatus === BlotterCaseStatus.DISMISSED,
      tooltip: 'Mediation by Punong Barangay (15 days, max 3 sessions)',
      isDecisionPoint: true
    },
    {
      label: 'Conciliation',
      description: '15 days, 3 sessions',
      icon: <Scale className="w-5 h-5" />,
      completed: currentStep > 5 || (currentStatus === BlotterCaseStatus.RESOLVED && conciliationStartDate),
      current: currentStep === 5,
      skipped: currentStatus === BlotterCaseStatus.DISMISSED ||
        (currentStatus === BlotterCaseStatus.RESOLVED && !conciliationStartDate),
      tooltip: 'Conciliation by Lupon (15 days, max 3 sessions)',
      isDecisionPoint: true
    },
    {
      label: 'Extension',
      description: '15 days',
      icon: <Clock className="w-5 h-5" />,
      completed: currentStep > 6,
      current: currentStep === 6,
      skipped: currentStatus === BlotterCaseStatus.DISMISSED ||
        currentStatus === BlotterCaseStatus.RESOLVED ||
        !extensionDate,
      tooltip: '15-day extension period for resolution'
    },
    {
      label: 'Certification to File Action',
      description: 'CFA',
      icon: <FileOutput className="w-5 h-5" />,
      completed: currentStatus === BlotterCaseStatus.CERTIFIED,
      current: currentStep === 7 && currentStatus === BlotterCaseStatus.CERTIFIED,
      skipped: currentStatus === BlotterCaseStatus.DISMISSED ||
        currentStatus === BlotterCaseStatus.RESOLVED ||
        currentStatus === BlotterCaseStatus.ESCALATED,
      tooltip: 'Certification to File Action (CFA) is issued'
    },
    {
      label: 'Escalate to Court',
      description: '',
      icon: <AlertCircle className="w-5 h-5" />,
      completed: currentStatus === BlotterCaseStatus.ESCALATED,
      current: currentStatus === BlotterCaseStatus.ESCALATED,
      skipped: currentStatus === BlotterCaseStatus.DISMISSED ||
        currentStatus === BlotterCaseStatus.RESOLVED ||
        currentStatus === BlotterCaseStatus.CERTIFIED ||
        currentStatus === BlotterCaseStatus.CLOSED,
      tooltip: 'Case escalated to Municipal/City Court'
    },
    {
      label: 'Case Closed',
      description: resolutionMethod || '',
      icon: <CheckCircle className="w-5 h-5" />,
      completed: currentStatus === BlotterCaseStatus.CLOSED ||
        currentStatus === BlotterCaseStatus.RESOLVED ||
        currentStatus === BlotterCaseStatus.DISMISSED,
      current: currentStatus === BlotterCaseStatus.CLOSED ||
        currentStatus === BlotterCaseStatus.RESOLVED ||
        currentStatus === BlotterCaseStatus.DISMISSED,
      skipped: false,
      tooltip: 'Case has been resolved, closed, or dismissed'
    },
  ];

  return (
    <div className="w-full py-4">
      <h3 className="text-lg font-semibold mb-2">Katarungang Pambarangay Process</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Current Status: <span className="font-medium">{currentStatus}</span>
        {resolutionMethod && <> • Resolution Method: <span className="font-medium">{resolutionMethod}</span></>}
      </p>

      {/* Process flow visualization */}
      <div className="relative">
        {/* Main flow path */}
        <div className="flex flex-col sm:flex-row items-start justify-between w-full gap-4 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col items-center ${step.skipped ? 'opacity-30' : ''}`}>
              {/* Step circle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center justify-center rounded-full w-10 h-10 
                      ${step.current ? 'bg-blue-100 text-blue-600 border-blue-600 animate-pulse' :
                        step.completed ? 'bg-green-100 text-green-600 border-green-600' :
                          'bg-gray-100 text-gray-400 border-gray-300'} 
                      border-2 relative`}>
                      {step.icon}
                      {step.isDecisionPoint && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-3 h-3"></div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.tooltip || step.label}</p>
                    {step.isDecisionPoint && (
                      <p className="text-amber-500 font-semibold text-xs mt-1">Decision point</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Step label */}
              <div className="text-center mt-2">
                <div className={`text-sm font-medium 
                  ${step.current ? 'text-blue-600' :
                    step.completed ? 'text-green-600' :
                      'text-gray-500'}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden sm:flex items-center">
                  <div className={`h-0.5 w-16 mt-5 ${step.completed && steps[index + 1].completed
                    ? 'bg-green-500'
                    : step.current || steps[index + 1].current
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                    }`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Decision point paths */}
        <div className="hidden sm:block">
          {/* Mediation outcome - Success */}
          {resolvedAtMediation && (
            <div className="absolute left-[20%] top-[50%] transform translate-y-2">
              <div className="border-2 border-green-500 border-dashed h-16 w-0"></div>
              <ArrowDownCircle className="w-5 h-5 text-green-500 absolute -bottom-2 -left-2" />
              <div className="absolute -bottom-8 -left-8 text-xs text-green-600 font-medium">
                Resolved
              </div>
            </div>
          )}

          {/* Conciliation outcome - Success */}
          {resolvedAtConciliation && (
            <div className="absolute left-[45%] top-[50%] transform translate-y-2">
              <div className="border-2 border-green-500 border-dashed h-16 w-0"></div>
              <ArrowDownCircle className="w-5 h-5 text-green-500 absolute -bottom-2 -left-2" />
              <div className="absolute -bottom-8 -left-8 text-xs text-green-600 font-medium">
                Resolved
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-600"></div>
          <span>Current Step</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-600"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Decision Point</span>
        </div>
        <div className="flex items-center gap-1 opacity-30">
          <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>
          <span>Skipped</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessFlow; 