# Barangay Centralized Data Management System

A comprehensive web application for centralizing citizen data and streamlining barangay operations.

## Tech Stack

- Next.js
- Prisma
- Shadcn-UI
- Tailwind CSS
- PostgreSQL
- MapBox

## Core Features

### 1. User Authentication & Roles

- **Super-administrator:** Full system access
- **Barangay Captain:** Complete data access, user management
- **Treasurer:** Treasury-related CRUD operations
- **Secretary:** Report generation and documentation

### 2. Citizen Profiling

Comprehensive resident data collection including:

#### Personal Information

- Basic details (name, birth, civil status)
- Contact information
- Educational and employment status
- Address (current and permanent)
- Family details
- Voter information

#### Data Fields

typescript
interface ResidentProfile {
// Basic Information
first_name: string
last_name: string
middle_name?: string
extension_name?: string
alias?: string
gender: string
place_of_birth: string
date_of_birth: Date
civil_status: string
// Contact & Demographics
educational_attainment: string
employment_status: string
blood_type?: string
religion?: string
ethnic_group?: string
nationality: string
email?: string
mobile_number?: string
landline_number?: string
// Address Information
house_number_street: string
city_address: string
province: string
region: string
permanent_address_same: boolean
permanent_house_number_street?: string
permanent_city_address?: string
permanent_province?: string
permanent_region?: string
// Family Information
user_photo?: string | null
mother_maiden_name?: string
mother_middle_name?: string
mother_first_name?: string
father_name?: string
father_last_name?: string
father_middle_name?: string
family_serial_number: string
head_of_household: boolean
family_role: string
// Voter Information
voter_in_barangay: boolean
voters_id_number?: string
last_voting_participation_date?: Date
}

### 3. GIS Mapping

- Interactive MapBox integration
- Geographical visualization of resident data
- Service area mapping

### 4. Communication System

- Announcement creation and distribution
- Email/SMS integration
- Targeted notifications

### 5. Analytics & Reporting

- Data aggregation and visualization
- Customizable report generation
- Export capabilities (PDF, CSV)

## Technical Architecture

### Frontend

- **Routing:** Next.js file-based routing
- **UI Components:** Shadcn-UI + Tailwind CSS
- **State Management:** React Context/Redux

### Backend

- **API:** Next.js API routes (REST/GraphQL)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js

## Security Considerations

- Role-based access control (RBAC)
- Data encryption
- Input validation
- Secure session management

## Deployment

- Frontend: Vercel (recommended)
- Database: Managed PostgreSQL service
- Environment: Production-grade hosting with SSL

## Development Guidelines

1. Follow Next.js best practices
2. Implement responsive design
3. Maintain code documentation
4. Write unit tests
5. Use TypeScript for type safety

## Performance Optimization

- Image optimization
- Code splitting
- Caching strategies
- Database indexing

## Database Schema

### Tables

1. **Users**
```typescript
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String
  role              Role      @default(SECRETARY)
  status            Status    @default(ACTIVE)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  profile           Profile?
  announcements     Announcement[]
  activities        Activity[]
}

enum Role {
  SUPER_ADMIN
  CAPTAIN
  SECRETARY
  TREASURER
}

enum Status {
  ACTIVE
  INACTIVE
}
```

2. **Profiles**
```typescript
model Profile {
  id                String    @id @default(cuid())
  user_id           String    @unique
  first_name        String
  last_name         String
  middle_name       String?
  contact_number    String?
  address           String?
  user              User      @relation(fields: [user_id], references: [id])
}
```

3. **Residents**
```typescript
model Resident {
  id                      String    @id @default(cuid())
  // Basic Information
  first_name              String
  last_name               String
  middle_name             String?
  extension_name          String?
  alias                   String?
  gender                  String
  place_of_birth         String
  date_of_birth          DateTime
  civil_status           String
  // Contact & Demographics
  educational_attainment  String
  employment_status       String
  blood_type             String?
  religion               String?
  ethnic_group           String?
  nationality            String
  email                  String?
  mobile_number          String?
  landline_number        String?
  // Address Information
  house_number_street     String
  city_address           String
  province               String
  region                 String
  permanent_address_same  Boolean
  permanent_house_number_street  String?
  permanent_city_address  String?
  permanent_province      String?
  permanent_region        String?
  // Family Information
  user_photo             String?
  mother_maiden_name      String?
  mother_middle_name      String?
  mother_first_name       String?
  father_name            String?
  father_last_name       String?
  father_middle_name      String?
  family_serial_number    String
  head_of_household      Boolean
  family_role            String
  // Voter Information
  voter_in_barangay      Boolean
  voters_id_number       String?
  last_voting_participation_date DateTime?
  // Metadata
  created_at             DateTime  @default(now())
  updated_at             DateTime  @updatedAt
  household              Household @relation(fields: [household_id], references: [id])
  household_id           String
  certificates           Certificate[]
}
```

4. **Households**
```typescript
model Household {
  id                String    @id @default(cuid())
  address           String
  coordinates       Json?     // For MapBox integration
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  residents         Resident[]
}
```

5. **Certificates**
```typescript
model Certificate {
  id                String    @id @default(cuid())
  type              CertificateType
  purpose           String
  issued_date       DateTime  @default(now())
  resident          Resident  @relation(fields: [resident_id], references: [id])
  resident_id       String
  issued_by         String
  status            String
  remarks           String?
}

enum CertificateType {
  RESIDENCY
  INDIGENCY
  CLEARANCE
  BUSINESS_PERMIT
}
```

6. **Announcements**
```typescript
model Announcement {
  id                String    @id @default(cuid())
  title             String
  content           String
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  author            User      @relation(fields: [author_id], references: [id])
  author_id         String
  status            String
}
```

7. **Activities**
```typescript
model Activity {
  id                String    @id @default(cuid())
  action            String
  description       String
  performed_at      DateTime  @default(now())
  user              User      @relation(fields: [user_id], references: [id])
  user_id           String
}
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── residents/
│   │   │   ├── households/
│   │   │   ├── certificates/
│   │   │   ├── announcements/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── residents/
│   │   │   ├── households/
│   │   │   ├── certificates/
│   │   │   └── announcements/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── maps/
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma/
│   │   ├── auth/
│   │   ├── utils/
│   │   └── validations/
│   ├── hooks/
│   ├── contexts/
│   └── types/
├── prisma/
│   └── schema.prisma
├── public/
├── docs/
└── tests/
```

### Key Directories Explained:

- **/src/app**: Next.js 13+ app directory with route groups and pages
- **/src/components**: Reusable UI components
- **/src/lib**: Utility functions, configurations, and shared logic
- **/src/hooks**: Custom React hooks
- **/src/contexts**: React Context providers
- **/src/types**: TypeScript type definitions
- **/prisma**: Database schema and migrations
- **/public**: Static assets
- **/docs**: Project documentation
- **/tests**: Test files