# Annual Investment Program (AIP) Implementation Plan

## Overview
The Annual Investment Program (AIP) is a critical fiscal management tool for barangays in the Philippines that outlines planned capital expenditures and investments for the upcoming fiscal year. This document outlines the implementation plan for adding AIP functionality to the existing barangay management system.

## Background
In the Philippine context, the AIP is required under the Local Government Code of 1991 (RA 7160). It serves as:
- A planning document that prioritizes investment programs/projects
- A compliance requirement for barangay funding and resource allocation
- A transparency tool for citizens to understand barangay development priorities

## Existing System Analysis
The current system includes:
- A financial management module with budget tracking
- Fiscal year management
- Revenue and expense recording
- Basic reporting capabilities

## Implementation Plan

### 1. Database Schema Enhancements

Add the following models to the Prisma schema:

```prisma
model AnnualInvestmentProgram {
  id                String      @id @default(cuid())
  fiscalYearId      String
  fiscalYear        FiscalYear  @relation(fields: [fiscalYearId], references: [id])
  title             String
  description       String?
  status            AIPStatus   @default(DRAFT)
  totalAmount       Float
  approvedDate      DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  createdById       String
  createdBy         User        @relation("AIPCreator", fields: [createdById], references: [id])
  approvedById      String?
  approvedBy        User?       @relation("AIPApprover", fields: [approvedById], references: [id])
  projects          AIPProject[]
  attachments       AIPAttachment[]

  @@schema("public")
}

enum AIPStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  IMPLEMENTED
  COMPLETED

  @@schema("public")
}

model AIPProject {
  id                    String    @id @default(cuid())
  aipId                 String
  aip                   AnnualInvestmentProgram @relation(fields: [aipId], references: [id], onDelete: Cascade)
  projectCode           String
  title                 String
  description           String
  sector                String    // e.g., Infrastructure, Health, Education, etc.
  location              String?
  expectedBeneficiaries String?
  startDate             DateTime
  endDate               DateTime
  totalCost             Float
  budgetCategoryId      String?
  budgetCategory        BudgetCategory? @relation(fields: [budgetCategoryId], references: [id])
  status                ProjectStatus @default(PLANNED)
  progress              Float      @default(0)
  fundSource            String?    // e.g., BDF, SK Fund, External, etc.
  milestones            AIPMilestone[]
  expenses              AIPExpense[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@schema("public")
}

enum ProjectStatus {
  PLANNED
  ONGOING
  COMPLETED
  CANCELLED
  DELAYED

  @@schema("public")
}

model AIPMilestone {
  id          String      @id @default(cuid())
  projectId   String
  project     AIPProject  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  description String?
  dueDate     DateTime
  completedAt DateTime?
  status      MilestoneStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@schema("public")
}

enum MilestoneStatus {
  PENDING
  COMPLETED
  DELAYED
  CANCELLED

  @@schema("public")
}

model AIPExpense {
  id          String      @id @default(cuid())
  projectId   String
  project     AIPProject  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  amount      Float
  description String
  date        DateTime
  reference   String?     // Invoice/receipt number
  transactionId String?
  transaction Transaction? @relation(fields: [transactionId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@schema("public")
}

model AIPAttachment {
  id          String      @id @default(cuid())
  aipId       String
  aip         AnnualInvestmentProgram @relation(fields: [aipId], references: [id], onDelete: Cascade)
  filename    String
  filepath    String
  filesize    Int
  filetype    String
  description String?
  uploadedAt  DateTime    @default(now())
  uploadedById String
  uploadedBy  User        @relation(fields: [uploadedById], references: [id])

  @@schema("public")
}
```

Also update the existing models:
- Add relations to User model for AIP creation/approval
- Add relations to Transaction model for tracking AIP expenses
- Add relation to BudgetCategory for categorizing AIP projects

### 2. API Endpoints

Create the following API endpoints:

#### AIP Management
- `GET /api/finance/aip` - List all AIPs
- `GET /api/finance/aip/:id` - Get AIP details
- `POST /api/finance/aip` - Create new AIP
- `PUT /api/finance/aip/:id` - Update AIP
- `DELETE /api/finance/aip/:id` - Delete AIP
- `PUT /api/finance/aip/:id/status` - Update AIP status
- `POST /api/finance/aip/:id/approve` - Approve AIP (with role permission)

#### AIP Projects
- `GET /api/finance/aip/:id/projects` - List AIP projects
- `GET /api/finance/aip/projects/:id` - Get project details
- `POST /api/finance/aip/:id/projects` - Add project to AIP
- `PUT /api/finance/aip/projects/:id` - Update project
- `DELETE /api/finance/aip/projects/:id` - Delete project
- `PUT /api/finance/aip/projects/:id/status` - Update project status

#### Milestones & Expenses
- `GET /api/finance/aip/projects/:id/milestones` - List project milestones
- `POST /api/finance/aip/projects/:id/milestones` - Add milestone
- `PUT /api/finance/aip/projects/:id/milestones/:milestoneId` - Update milestone
- `GET /api/finance/aip/projects/:id/expenses` - List project expenses
- `POST /api/finance/aip/projects/:id/expenses` - Add expense

### 3. User Interface Components

#### AIP Dashboard
- Create a new section in the Finance module for AIP management
- Dashboard with summary of current AIP status, progress, and budget utilization
- Filtering options by fiscal year and project status

#### AIP Creation & Management
- Form for creating new AIP with fiscal year selection
- AIP details view with projects listing
- Status tracking and approval workflow
- Document attachment capabilities

#### Project Management
- Project creation form with budget category selection
- Project timeline visualization
- Progress tracking with milestones
- Expense recording linked to financial transactions
- Project status updates

#### Reports & Analytics
- AIP budget vs. actual expenditure reports
- Project completion rate analytics
- Sectoral investment distribution charts
- Timeline visualization for project implementation

### 4. Integration with Existing Modules

#### Fiscal Year Integration
- Link AIP to fiscal year planning process
- Ensure AIP data is associated with the correct fiscal year

#### Budget Module Integration
- Connect AIP projects to budget categories
- Track budget allocation and utilization for AIP projects

#### Financial Transactions
- Link expenses recorded for AIP projects to the main transaction ledger
- Ensure financial reports reflect AIP expenditures

#### User Permissions
- Extend existing role-based permissions to include AIP management
- Restrict approval capabilities to authorized roles (CAPTAIN, TREASURER)

### 5. Implementation Phases

#### Phase 1: Database Schema & API Setup
- Implement database schema changes
- Create API endpoints for core AIP management
- Basic role permission setup

#### Phase 2: Core UI Implementation
- Develop AIP creation and management interfaces
- Implement project management screens
- Create basic reporting

#### Phase 3: Integration & Advanced Features
- Integrate with budget and fiscal year modules
- Implement approval workflows
- Add document management capabilities
- Develop advanced reporting and analytics

#### Phase 4: Testing & Deployment
- User acceptance testing
- Data migration for existing fiscal years
- Training documentation
- Production deployment

## Compliance & Best Practices

- Ensure alignment with Department of the Interior and Local Government (DILG) guidelines
- Follow Commission on Audit (COA) requirements for financial planning
- Implement proper audit trails for all AIP-related activities
- Support transparency requirements with public-facing reports

## Technical Requirements

- Use existing React/Next.js frontend framework
- Implement Prisma schema changes for database models
- Ensure responsive design for mobile access
- Add necessary validation for financial data
- Implement proper error handling and data validation

## Timeline Estimate

- Phase 1: 2 weeks
- Phase 2: 3 weeks
- Phase 3: 3 weeks
- Phase 4: 2 weeks

Total implementation time: Approximately 10 weeks 