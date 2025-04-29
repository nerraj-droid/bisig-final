// Blotter Management Enums
export enum BlotterCaseStatus {
  FILED = 'FILED',              // Initial filing of complaint
  DOCKETED = 'DOCKETED',        // Received in docket
  SUMMONED = 'SUMMONED',        // Respondent summoned
  MEDIATION = 'MEDIATION',      // Under mediation by Punong Barangay
  CONCILIATION = 'CONCILIATION',// Under conciliation by Lupon
  EXTENDED = 'EXTENDED',        // 15-day extension granted
  RESOLVED = 'RESOLVED',        // Case resolved successfully
  CLOSED = 'CLOSED',            // Case administratively closed
  DISMISSED = 'DISMISSED',      // Case dismissed/withdrawn
  ESCALATED = 'ESCALATED',      // Escalated to court
  CERTIFIED = 'CERTIFIED',      // Certification to File Action issued
  PENDING = 'PENDING',          // Legacy status
  ONGOING = 'ONGOING'           // Legacy status
}

export enum BlotterPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum BlotterPartyType {
  COMPLAINANT = 'COMPLAINANT',
  RESPONDENT = 'RESPONDENT',
  WITNESS = 'WITNESS'
}

export enum HearingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
} 