const { PrismaClient, Gender, CivilStatus, HouseholdType, HouseholdStatus, Role, Status, CertificateType } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Define enums directly instead of importing
const BlotterCaseStatus = {
  PENDING: 'PENDING',
  ONGOING: 'ONGOING',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED'
};

const BlotterPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

const BlotterPartyType = {
  COMPLAINANT: 'COMPLAINANT',
  RESPONDENT: 'RESPONDENT',
  WITNESS: 'WITNESS'
};

const HearingStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED'
};

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  
  // Clear existing data
  await clearDatabase();
  
  // Create users
  const users = await createUsers();
  
  // Create barangay info
  const barangayInfo = await createBarangayInfo();
  
  // Create council members
  const councilMembers = await createCouncilMembers();
  
  // Create officials
  const officials = await createOfficials();
  
  // Create certificate templates
  const certificateTemplates = await createCertificateTemplates();
  
  // Create households
  const households = await createHouseholds();
  
  // Create residents
  const residents = await createResidents(households);
  
  // Create certificates
  await createCertificates(residents, officials);
  
  // Create relief records
  await createReliefRecords(residents);
  
  // Create blotter cases
  await createBlotterCases(residents, users);
  
  console.log(`Seeding finished.`);
}

async function clearDatabase() {
  // Delete in the correct order to respect foreign key constraints
  await prisma.$executeRaw`TRUNCATE TABLE "public"."BlotterAttachment" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."BlotterStatusUpdate" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."BlotterHearing" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."BlotterParty" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."BlotterCase" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Certificate" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."ReliefRecord" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Resident" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."HouseholdStatistic" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Household" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."CertificateTemplate" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."CouncilMember" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."BarangayInfo" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Officials" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Session" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."Account" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "public"."User" CASCADE;`;
  
  console.log("Database cleared");
}

async function createUsers() {
  const passwordHash = await bcrypt.hash("Password123", 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "usr-001",
        name: "Admin User",
        email: "admin@example.com",
        password: passwordHash,
        role: Role.SUPER_ADMIN,
        status: Status.ACTIVE,
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: "usr-002",
        name: "Barangay Captain",
        email: "captain@example.com",
        password: passwordHash,
        role: Role.CAPTAIN,
        status: Status.ACTIVE,
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: "usr-003",
        name: "Barangay Secretary",
        email: "secretary@example.com",
        password: passwordHash,
        role: Role.SECRETARY,
        status: Status.ACTIVE,
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: "usr-004",
        name: "Barangay Treasurer",
        email: "treasurer@example.com",
        password: passwordHash,
        role: Role.TREASURER,
        status: Status.ACTIVE,
        updatedAt: new Date(),
      },
    }),
  ]);
  
  console.log(`Created ${users.length} users`);
  return users;
}

async function createBarangayInfo() {
  const barangayInfo = await prisma.barangayInfo.create({
    data: {
      name: "Barangay Sample",
      district: "District 1",
      city: "Sample City",
      province: "Sample Province",
      address: "123 Main Street, Sample City",
      contactNumber: "(123) 456-7890",
      email: "barangayofficial@example.com",
      website: "https://barangay-sample.gov.ph",
      postalCode: "1234",
      footerText: "Barangay Sample - Serving the community since 1970",
      updatedAt: new Date(),
    },
  });
  
  console.log(`Created barangay info: ${barangayInfo.name}`);
  return barangayInfo;
}

async function createCouncilMembers() {
  const councilMembers = await Promise.all([
    prisma.councilMember.create({
      data: {
        name: "Juan Dela Cruz",
        position: "Punong Barangay",
        order: 1,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Maria Santos",
        position: "Kagawad - Health",
        order: 2,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Pedro Reyes",
        position: "Kagawad - Education",
        order: 3,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Elena Garcia",
        position: "Kagawad - Peace and Order",
        order: 4,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Roberto Lim",
        position: "Kagawad - Infrastructure",
        order: 5,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Sofia Mendoza",
        position: "Kagawad - Youth and Sports",
        order: 6,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Antonio Villanueva",
        position: "Kagawad - Environmental Protection",
        order: 7,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Luisa Tan",
        position: "Kagawad - Senior Citizens",
        order: 8,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.councilMember.create({
      data: {
        name: "Miguel Fernandez",
        position: "SK Chairman",
        order: 9,
        isActive: true,
        updatedAt: new Date(),
      },
    }),
  ]);
  
  console.log(`Created ${councilMembers.length} council members`);
  return councilMembers;
}

async function createOfficials() {
  const officials = await prisma.officials.create({
    data: {
      id: "off-001",
      punongBarangay: "Juan Dela Cruz",
      secretary: "Maria Santos",
      treasurer: "Pedro Reyes",
    },
  });
  
  console.log(`Created officials record`);
  return officials;
}

async function createCertificateTemplates() {
  const templates = await Promise.all([
    prisma.certificateTemplate.create({
      data: {
        type: "RESIDENCY",
        name: "Standard Barangay Residency",
        content: `<p>This is to certify that [RESIDENT_NAME], [RESIDENT_AGE] years old, is a bonafide resident of [ADDRESS] for more than [YEARS] years now.</p>
        <p>This certification is being issued upon the request of the above-named person for [PURPOSE] purposes.</p>`,
        headerHtml: `<div style="text-align: center;"><h1>Barangay Residency Certificate</h1></div>`,
        footerHtml: `<div style="text-align: center;"><p>Issued on [DATE]</p></div>`,
        cssStyles: `body { font-family: Arial, sans-serif; }`,
        isDefault: true,
        updatedAt: new Date(),
      },
    }),
    prisma.certificateTemplate.create({
      data: {
        type: "INDIGENCY",
        name: "Standard Barangay Indigency",
        content: `<p>This is to certify that [RESIDENT_NAME], [RESIDENT_AGE] years old, is a bonafide resident of [ADDRESS] and known to be indigent in our barangay.</p>
        <p>This certification is being issued upon the request of the above-named person for [PURPOSE] purposes.</p>`,
        headerHtml: `<div style="text-align: center;"><h1>Certificate of Indigency</h1></div>`,
        footerHtml: `<div style="text-align: center;"><p>Issued on [DATE]</p></div>`,
        cssStyles: `body { font-family: Arial, sans-serif; }`,
        isDefault: true,
        updatedAt: new Date(),
      },
    }),
    prisma.certificateTemplate.create({
      data: {
        type: "CLEARANCE",
        name: "Standard Barangay Clearance",
        content: `<p>This is to certify that [RESIDENT_NAME], [RESIDENT_AGE] years old, is a bonafide resident of [ADDRESS] and has no derogatory record on file in our barangay.</p>
        <p>This certification is being issued upon the request of the above-named person for [PURPOSE] purposes.</p>`,
        headerHtml: `<div style="text-align: center;"><h1>Barangay Clearance</h1></div>`,
        footerHtml: `<div style="text-align: center;"><p>Issued on [DATE]</p></div>`,
        cssStyles: `body { font-family: Arial, sans-serif; }`,
        isDefault: true,
        updatedAt: new Date(),
      },
    }),
    prisma.certificateTemplate.create({
      data: {
        type: "BUSINESS_PERMIT",
        name: "Standard Business Permit",
        content: `<p>This is to certify that the business named [BUSINESS_NAME] owned by [OWNER_NAME] located at [BUSINESS_ADDRESS] is granted permission to operate within the jurisdiction of our barangay.</p>
        <p>This permit is valid for one year from the date of issuance.</p>`,
        headerHtml: `<div style="text-align: center;"><h1>Barangay Business Permit</h1></div>`,
        footerHtml: `<div style="text-align: center;"><p>Issued on [DATE]</p></div>`,
        cssStyles: `body { font-family: Arial, sans-serif; }`,
        isDefault: true,
        updatedAt: new Date(),
      },
    }),
  ]);
  
  console.log(`Created ${templates.length} certificate templates`);
  return templates;
}

async function createHouseholds() {
  const householdData = [
    {
      id: "hh-001",
      houseNo: "123",
      street: "Maple Street",
      barangay: "Barangay Sample",
      city: "Sample City",
      province: "Sample Province",
      zipCode: "1234",
      type: HouseholdType.SINGLE_FAMILY,
      status: HouseholdStatus.ACTIVE,
      notes: "Family of 5, main residence",
    },
    {
      id: "hh-002",
      houseNo: "456",
      street: "Oak Avenue",
      barangay: "Barangay Sample",
      city: "Sample City",
      province: "Sample Province",
      zipCode: "1234",
      type: HouseholdType.EXTENDED_FAMILY,
      status: HouseholdStatus.ACTIVE,
      notes: "Extended family with grandparents",
    },
    {
      id: "hh-003",
      houseNo: "789",
      street: "Pine Road",
      barangay: "Barangay Sample",
      city: "Sample City",
      province: "Sample Province",
      zipCode: "1234",
      type: HouseholdType.MULTI_FAMILY,
      status: HouseholdStatus.ACTIVE,
      notes: "Two related families sharing one household",
    },
    {
      id: "hh-004",
      houseNo: "101",
      street: "Cedar Lane",
      barangay: "Barangay Sample",
      city: "Sample City",
      province: "Sample Province",
      zipCode: "1234",
      type: HouseholdType.SINGLE_PERSON,
      status: HouseholdStatus.ACTIVE,
      notes: "Single occupant residence",
    },
    {
      id: "hh-005",
      houseNo: "202",
      street: "Birch Boulevard",
      barangay: "Barangay Sample",
      city: "Sample City",
      province: "Sample Province",
      zipCode: "1234",
      type: HouseholdType.NON_FAMILY,
      status: HouseholdStatus.ACTIVE,
      notes: "Shared housing for non-related individuals",
    },
  ];
  
  const households = await Promise.all(
    householdData.map((data) =>
      prisma.household.create({
        data: {
          ...data,
          longitude: Math.random() * (121.1 - 120.9) + 120.9, // Random coordinates for Manila area
          latitude: Math.random() * (14.7 - 14.5) + 14.5,
          updatedAt: new Date(),
          statistics: {
            create: {
              totalResidents: Math.floor(Math.random() * 8) + 1,
              voterCount: Math.floor(Math.random() * 6),
              seniorCount: Math.floor(Math.random() * 3),
              minorCount: Math.floor(Math.random() * 4),
              employedCount: Math.floor(Math.random() * 5),
            },
          },
        },
      })
    )
  );
  
  console.log(`Created ${households.length} households`);
  return households;
}

async function createResidents(households) {
  const firstNames = ["John", "Maria", "Pedro", "Sofia", "Antonio", "Elena", "Miguel", "Lucia", "Roberto", "Camila"];
  const middleNames = ["Garcia", "Santos", "Reyes", "Cruz", "Lopez", "Mendoza", "Torres", "Gomez", "Rivera", "Flores"];
  const lastNames = ["Dela Cruz", "Santos", "Reyes", "Gonzales", "Ramos", "Mendoza", "Torres", "Gomez", "Rivera", "Flores"];
  const occupations = ["Teacher", "Engineer", "Doctor", "Nurse", "Driver", "Vendor", "Carpenter", "Electrician", "Student", "Retired"];
  const employmentStatuses = ["EMPLOYED", "UNEMPLOYED", "SELF_EMPLOYED", "STUDENT", "RETIRED"];
  const educationalAttainments = ["Elementary", "High School", "College", "Vocational", "Post Graduate"];
  const religions = ["Roman Catholic", "Protestant", "Islam", "Buddhism", "Iglesia ni Cristo"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  const residentsData = [];
  
  // Create 20 residents
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const birthYear = Math.floor(Math.random() * 80) + 1940;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    
    const household = households[Math.floor(Math.random() * households.length)];
    const civilStatusOptions = [CivilStatus.SINGLE, CivilStatus.MARRIED, CivilStatus.WIDOWED, CivilStatus.DIVORCED, CivilStatus.SEPARATED];
    
    const resident = {
      id: `res-${(i + 1).toString().padStart(3, "0")}`,
      firstName,
      middleName,
      lastName,
      birthDate,
      gender,
      civilStatus: civilStatusOptions[Math.floor(Math.random() * civilStatusOptions.length)],
      contactNo: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(" ", "")}@example.com`,
      occupation: occupations[Math.floor(Math.random() * occupations.length)],
      employmentStatus: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
      address: `${household.houseNo} ${household.street}, ${household.barangay}, ${household.city}, ${household.province}`,
      householdId: household.id,
      educationalAttainment: educationalAttainments[Math.floor(Math.random() * educationalAttainments.length)],
      religion: religions[Math.floor(Math.random() * religions.length)],
      nationality: "Filipino",
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      voterInBarangay: Math.random() > 0.3,
      sectors: getRandomSectors(),
      updatedAt: new Date(),
    };
    
    residentsData.push(resident);
  }
  
  const residents = await Promise.all(
    residentsData.map((data) => prisma.resident.create({ data }))
  );
  
  console.log(`Created ${residents.length} residents`);
  return residents;
}

function getRandomSectors() {
  const sectors = ["Senior Citizen", "Youth", "Women", "PWD", "LGBTQ+", "Indigenous People", "Farmer", "Fisher"];
  const selectedSectors = [];
  const numSectors = Math.floor(Math.random() * 3) + 1; // 1 to 3 sectors
  
  for (let i = 0; i < numSectors; i++) {
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    if (!selectedSectors.includes(sector)) {
      selectedSectors.push(sector);
    }
  }
  
  return selectedSectors;
}

async function createCertificates(residents, officials) {
  const certificatePurposes = [
    "Employment",
    "Scholarship Application",
    "School Enrollment",
    "Bank Transaction",
    "Travel Requirement",
    "Government ID Application",
    "Medical Assistance",
    "Financial Assistance",
    "Legal Proceedings",
    "Business Permit Application",
  ];
  
  // Create certificates for random residents
  for (let i = 0; i < 15; i++) {
    const resident = residents[Math.floor(Math.random() * residents.length)];
    const certificateTypes = [CertificateType.RESIDENCY, CertificateType.INDIGENCY, CertificateType.CLEARANCE, CertificateType.BUSINESS_PERMIT];
    const type = certificateTypes[Math.floor(Math.random() * certificateTypes.length)];
    const purpose = certificatePurposes[Math.floor(Math.random() * certificatePurposes.length)];
    const issuedDate = new Date();
    issuedDate.setDate(issuedDate.getDate() - Math.floor(Math.random() * 180)); // Random date within last 6 months
    
    // Create certificate with Prisma Client instead of raw SQL to avoid type casting issues
    await prisma.certificate.create({
      data: {
        id: `cert-${(i + 1).toString().padStart(3, "0")}`,
        purpose,
        controlNumber: `CN-${new Date().getFullYear()}-${(i + 1).toString().padStart(5, "0")}`,
        status: Math.random() > 0.2 ? "ISSUED" : "PENDING",
        issuedDate: Math.random() > 0.2 ? issuedDate : null,
        officialId: officials.id,
        residentId: resident.id,
        type,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  console.log(`Created 15 certificates`);
}

async function createReliefRecords(residents) {
  const reliefTypes = ["Cash Aid", "Food Pack", "Medical Supplies", "Housing Materials", "School Supplies"];
  const statuses = ["PENDING", "APPROVED", "DISTRIBUTED", "REJECTED"];
  
  const reliefRecordsData = [];
  
  // Create relief records for random residents
  for (let i = 0; i < 30; i++) {
    const resident = residents[Math.floor(Math.random() * residents.length)];
    const type = reliefTypes[Math.floor(Math.random() * reliefTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.floor(Math.random() * 5000) + 500; // Random amount between 500 and 5500
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 3 months
    
    const reliefRecord = {
      type,
      amount,
      status,
      notes: `${type} provided during ${Math.random() > 0.5 ? "pandemic relief efforts" : "disaster response"}`,
      createdAt: createdDate,
      updatedAt: new Date(),
      residentId: resident.id,
    };
    
    reliefRecordsData.push(reliefRecord);
  }
  
  const reliefRecords = await Promise.all(
    reliefRecordsData.map((data) => prisma.reliefRecord.create({ data }))
  );
  
  console.log(`Created ${reliefRecords.length} relief records`);
  return reliefRecords;
}

async function createBlotterCases(residents, users) {
  const incidentTypes = [
    "Noise Complaint",
    "Property Dispute",
    "Physical Injury",
    "Verbal Abuse",
    "Threat",
    "Theft",
    "Damage to Property",
    "Public Disturbance",
    "Family Problem",
    "Animal Complaint",
  ];
  
  const incidentLocations = [
    "Maple Street corner Oak Avenue",
    "Near the barangay hall",
    "Pine Road residential area",
    "Cedar Lane playground",
    "Birch Boulevard commercial strip",
    "Public market area",
    "Basketball court",
    "Elementary school vicinity",
    "Corner store at Acacia Street",
    "Residential compound at Walnut Drive",
  ];
  
  try {
    // Create 15 blotter cases
    for (let i = 0; i < 15; i++) {
      const caseId = `BLT-${new Date().getFullYear()}-${(i + 1).toString().padStart(4, "0")}`;
      const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      
      const statusOptions = [BlotterCaseStatus.PENDING, BlotterCaseStatus.ONGOING, BlotterCaseStatus.RESOLVED, BlotterCaseStatus.ESCALATED];
      const priorityOptions = [BlotterPriority.LOW, BlotterPriority.MEDIUM, BlotterPriority.HIGH, BlotterPriority.URGENT];
      
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const priority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)];
      
      // Create dates
      const reportDate = new Date();
      reportDate.setDate(reportDate.getDate() - Math.floor(Math.random() * 60)); // Random date within last 2 months
      
      const incidentDate = new Date(reportDate);
      incidentDate.setDate(incidentDate.getDate() - Math.floor(Math.random() * 7)); // Incident happened 0-7 days before report
      
      const incidentTime = `${Math.floor(Math.random() * 24).toString().padStart(2, "0")}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}`;
      
      const user = users[Math.floor(Math.random() * users.length)];
      
      // Create blotter case with prisma client
      const blotterCase = await prisma.blotterCase.create({
        data: {
          id: `blot-${(i + 1).toString().padStart(3, "0")}`,
          caseNumber: caseId,
          reportDate,
          incidentDate,
          incidentTime,
          incidentLocation: incidentLocations[Math.floor(Math.random() * incidentLocations.length)],
          incidentType,
          incidentDescription: `The incident involved ${incidentType.toLowerCase()} and occurred on ${incidentDate.toLocaleDateString()} at approximately ${incidentTime}. ${
            Math.random() > 0.5
              ? "The complainant reported that the incident caused significant distress and is seeking resolution."
              : "Multiple witnesses confirmed the incident took place as described by the complainant."
          }`,
          status,
          priority,
          createdAt: reportDate,
          updatedAt: new Date(),
          createdById: user.id,
        }
      });
      
      // Create complainant party
      const complainant = residents[Math.floor(Math.random() * residents.length)];
      await prisma.blotterParty.create({
        data: {
          id: `party-complainant-${i}`,
          blotterCaseId: blotterCase.id,
          residentId: Math.random() > 0.5 ? complainant.id : null,
          partyType: BlotterPartyType.COMPLAINANT,
          firstName: complainant.firstName,
          middleName: complainant.middleName,
          lastName: complainant.lastName,
          address: complainant.address,
          contactNumber: complainant.contactNo,
          email: complainant.email,
          isResident: Math.random() > 0.5,
          notes: `Primary complainant in the ${incidentType} case`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Create respondent party
      const respondent = residents[Math.floor(Math.random() * residents.length)];
      if (respondent.id !== complainant.id) {
        await prisma.blotterParty.create({
          data: {
            id: `party-respondent-${i}`,
            blotterCaseId: blotterCase.id,
            residentId: Math.random() > 0.5 ? respondent.id : null,
            partyType: BlotterPartyType.RESPONDENT,
            firstName: respondent.firstName,
            middleName: respondent.middleName,
            lastName: respondent.lastName,
            address: respondent.address,
            contactNumber: respondent.contactNo,
            email: respondent.email,
            isResident: Math.random() > 0.5,
            notes: `Primary respondent in the ${incidentType} case`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      
      // Add a witness in some cases
      if (Math.random() > 0.7) {
        const witness = residents[Math.floor(Math.random() * residents.length)];
        if (witness.id !== complainant.id && witness.id !== respondent.id) {
          await prisma.blotterParty.create({
            data: {
              id: `party-witness-${i}`,
              blotterCaseId: blotterCase.id,
              residentId: Math.random() > 0.5 ? witness.id : null,
              partyType: BlotterPartyType.WITNESS,
              firstName: witness.firstName,
              middleName: witness.middleName,
              lastName: witness.lastName,
              address: witness.address,
              contactNumber: witness.contactNo,
              email: witness.email,
              isResident: Math.random() > 0.5,
              notes: `Witness to the ${incidentType} incident`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      }
      
      // Create hearings for ongoing cases
      if (status === BlotterCaseStatus.ONGOING || status === BlotterCaseStatus.RESOLVED) {
        const numHearings = Math.floor(Math.random() * 3) + 1; // 1-3 hearings
        
        for (let h = 0; h < numHearings; h++) {
          const hearingDate = new Date(reportDate);
          hearingDate.setDate(hearingDate.getDate() + (h + 1) * 7); // Weekly hearings after report
          
          const hearingTime = `${Math.floor(Math.random() * 8) + 9}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")} ${
            Math.random() > 0.5 ? "AM" : "PM"
          }`;
          
          const hearingStatusOptions = [HearingStatus.COMPLETED, HearingStatus.COMPLETED, HearingStatus.COMPLETED, HearingStatus.CANCELLED, HearingStatus.RESCHEDULED];
          
          const hearingStatus =
            hearingDate < new Date()
              ? hearingStatusOptions[Math.floor(Math.random() * hearingStatusOptions.length)]
              : HearingStatus.SCHEDULED;
          
          await prisma.blotterHearing.create({
            data: {
              id: `hearing-${i}-${h}`,
              blotterCaseId: blotterCase.id,
              date: hearingDate,
              time: hearingTime,
              location: "Barangay Hall - Conference Room",
              status: hearingStatus,
              notes: `Hearing ${h + 1} for case ${caseId}`,
              minutesNotes:
                hearingStatus === HearingStatus.COMPLETED
                  ? `Both parties presented their accounts of the incident. The barangay officials facilitated a discussion to explore possible resolutions.`
                  : null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      }
      
      // Create status updates
      const numUpdates = Math.floor(Math.random() * 4) + 1; // 1-4 updates
      
      for (let u = 0; u < numUpdates; u++) {
        const updateDate = new Date(reportDate);
        updateDate.setDate(updateDate.getDate() + Math.floor(Math.random() * 10)); // Random update within 10 days
        
        let updateStatus;
        if (u === 0) {
          updateStatus = BlotterCaseStatus.PENDING; // Initial status
        } else if (u === numUpdates - 1) {
          updateStatus = status; // Final status matches case status
        } else {
          updateStatus = [BlotterCaseStatus.PENDING, BlotterCaseStatus.ONGOING][Math.floor(Math.random() * 2)]; // Intermediate status
        }
        
        await prisma.blotterStatusUpdate.create({
          data: {
            id: `update-${i}-${u}`,
            blotterCaseId: blotterCase.id,
            status: updateStatus,
            notes:
              updateStatus === BlotterCaseStatus.PENDING
                ? `Case filed and registered. Initial assessment completed.`
                : updateStatus === BlotterCaseStatus.ONGOING
                ? `Case proceeding with mediation. Parties notified of hearing schedule.`
                : updateStatus === BlotterCaseStatus.RESOLVED
                ? `Case successfully resolved through mediation. Parties have reached an agreement.`
                : `Case escalated to higher authorities due to complexity or failure to reach agreement.`,
            updatedById: user.id,
            createdAt: updateDate
          }
        });
      }
    }
    
    console.log(`Created 15 blotter cases with parties, hearings and status updates`);
    return true;
  } catch (error) {
    console.error("Error creating blotter data:", error);
    return { error };
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = { main }; 