// Blotter Management Enums
export enum BlotterCaseStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED'
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