const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const { randomUUID } = require("crypto");

const prisma = new PrismaClient();

async function seedUsers() {
    const exists = await prisma.user.findFirst({
        where: {
            email: "admin@example.com",
        },
    });

    if (!exists) {
        // Create default users
        const defaultUsers = [
            {
                email: "admin@example.com",
                name: "Super Admin",
                password: "admin123",
                role: "SUPER_ADMIN",
            },
            {
                email: "captain@example.com",
                name: "Barangay Captain",
                password: "captain123",
                role: "CAPTAIN",
            },
            {
                email: "secretary@example.com",
                name: "Barangay Secretary",
                password: "secretary123",
                role: "SECRETARY",
            },
            {
                email: "treasurer@example.com",
                name: "Barangay Treasurer",
                password: "treasurer123",
                role: "TREASURER",
            },
        ];

        for (const user of defaultUsers) {
            const hashedPassword = await hash(user.password, 10);
            await prisma.user.create({
                data: {
                    id: randomUUID(),
                    email: user.email,
                    name: user.name,
                    password: hashedPassword,
                    role: user.role,
                    updatedAt: new Date(),
                },
            });
            console.log(`${user.role} user created successfully!`);
        }
    } else {
        console.log("Users already exist!");
    }
}

async function seedHouseholds() {
    const householdsCount = await prisma.household.count();

    if (householdsCount === 0) {
        const households = [
            {
                id: randomUUID(),
                houseNo: "123",
                street: "Main Street",
                barangay: "Sample Barangay",
                city: "Sample City",
                province: "Sample Province",
                zipCode: "1234",
                latitude: 14.5995,
                longitude: 120.9842,
                updatedAt: new Date(),
            },
            {
                id: randomUUID(),
                houseNo: "456",
                street: "Secondary Street",
                barangay: "Sample Barangay",
                city: "Sample City",
                province: "Sample Province",
                zipCode: "1234",
                latitude: 14.6005,
                longitude: 120.9852,
                updatedAt: new Date(),
            },
            {
                id: randomUUID(),
                houseNo: "789",
                street: "Third Street",
                barangay: "Sample Barangay",
                city: "Sample City",
                province: "Sample Province",
                zipCode: "1234",
                latitude: 14.6015,
                longitude: 120.9862,
                updatedAt: new Date(),
            },
        ];

        await prisma.household.createMany({
            data: households,
        });
        console.log("Sample households created successfully!");
    } else {
        console.log("Households already exist!");
    }
}

async function seedResidents() {
    const residentsCount = await prisma.resident.count();

    if (residentsCount === 0) {
        // Get all households for sample data
        const households = await prisma.household.findMany();

        if (households.length > 0) {
            const residents = [
                {
                    id: randomUUID(),
                    firstName: "Juan",
                    middleName: "Dela",
                    lastName: "Cruz",
                    birthDate: new Date("1990-01-15"),
                    gender: "MALE",
                    civilStatus: "MARRIED",
                    contactNo: "09123456789",
                    email: "juan@example.com",
                    occupation: "Teacher",
                    address: `${households[0].houseNo} ${households[0].street}`,
                    householdId: households[0].id,
                    educationalAttainment: "College Graduate",
                    religion: "Catholic",
                    nationality: "Filipino",
                    voterInBarangay: true,
                    headOfHousehold: true,
                    updatedAt: new Date(),
                },
                {
                    id: randomUUID(),
                    firstName: "Maria",
                    middleName: "Santos",
                    lastName: "Cruz",
                    birthDate: new Date("1992-03-20"),
                    gender: "FEMALE",
                    civilStatus: "MARRIED",
                    contactNo: "09187654321",
                    email: "maria@example.com",
                    occupation: "Nurse",
                    address: `${households[0].houseNo} ${households[0].street}`,
                    householdId: households[0].id,
                    educationalAttainment: "College Graduate",
                    religion: "Catholic",
                    nationality: "Filipino",
                    voterInBarangay: true,
                    updatedAt: new Date(),
                },
                {
                    id: randomUUID(),
                    firstName: "Pedro",
                    lastName: "Santos",
                    birthDate: new Date("1985-06-10"),
                    gender: "MALE",
                    civilStatus: "SINGLE",
                    contactNo: "09199999999",
                    occupation: "Engineer",
                    address: `${households[1].houseNo} ${households[1].street}`,
                    householdId: households[1].id,
                    educationalAttainment: "Master's Degree",
                    religion: "Catholic",
                    nationality: "Filipino",
                    voterInBarangay: true,
                    headOfHousehold: true,
                    updatedAt: new Date(),
                },
            ];

            for (const resident of residents) {
                await prisma.resident.create({
                    data: resident,
                });
            }
            console.log("Sample residents created successfully!");
        }
    } else {
        console.log("Residents already exist!");
    }
}

async function seedOfficials() {
    const officialsCount = await prisma.officials.count();

    if (officialsCount === 0) {
        await prisma.officials.create({
            data: {
                id: randomUUID(),
                punongBarangay: "Hon. Juan Dela Cruz",
                secretary: "Maria Santos",
                treasurer: "Pedro Reyes",
            },
        });
        console.log("Sample officials created successfully!");
    } else {
        console.log("Officials already exist!");
    }
}

async function seedCertificates() {
    const certificatesCount = await prisma.certificate.count();

    if (certificatesCount === 0) {
        // Get a resident and officials for sample data
        const resident = await prisma.resident.findFirst();
        const officials = await prisma.officials.findFirst();

        if (resident && officials) {
            const certificates = [
                {
                    id: randomUUID(),
                    type: "RESIDENCY",
                    purpose: "Employment Requirement",
                    controlNumber: "RES-2024-001",
                    status: "Approved",
                    issuedDate: new Date(),
                    residentId: resident.id,
                    officialId: officials.id,
                    updatedAt: new Date(),
                },
                {
                    id: randomUUID(),
                    type: "INDIGENCY",
                    purpose: "Medical Assistance",
                    controlNumber: "IND-2024-001",
                    status: "Approved",
                    issuedDate: new Date(),
                    residentId: resident.id,
                    officialId: officials.id,
                    updatedAt: new Date(),
                },
                {
                    id: randomUUID(),
                    type: "CLEARANCE",
                    purpose: "Police Requirement",
                    controlNumber: "CLR-2024-001",
                    status: "Pending",
                    residentId: resident.id,
                    officialId: officials.id,
                    updatedAt: new Date(),
                },
            ];

            for (const certificate of certificates) {
                await prisma.certificate.create({
                    data: certificate,
                });
            }
            console.log("Sample certificates created successfully!");
        }
    } else {
        console.log("Certificates already exist!");
    }
}

async function seedBlotterCases() {
    const blotterCount = await prisma.blotterCase.count();
    
    if (blotterCount === 0) {
        // Create a test blotter case
        const blotterCase = await prisma.blotterCase.create({
            data: {
                id: "blot-001",
                caseNumber: "BC-2024-001",
                incidentDate: new Date("2024-04-05"),
                incidentTime: "14:30",
                incidentLocation: "Main Street",
                incidentType: "Dispute",
                incidentDescription: "Verbal altercation between neighbors",
                status: "PENDING",
                priority: "MEDIUM",
                updatedAt: new Date(),
            }
        });
        
        // Create status update WITHOUT the updatedById field
        await prisma.blotterStatusUpdate.create({
            data: {
                id: "update-0-0",
                blotterCaseId: "blot-001",
                status: "PENDING",
                notes: "Case filed and registered. Initial assessment completed.",
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        
        console.log("Sample blotter cases created successfully!");
    } else {
        console.log("Blotter cases already exist!");
    }
}

async function main() {
    try {
        await seedUsers();
        await seedHouseholds();
        await seedResidents();
        await seedOfficials();
        await seedCertificates();
        await seedBlotterCases();
        console.log("Database seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 