const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcryptjs")
const prisma = new PrismaClient()

module.exports.createAdminUser = async function () {
    const exists = await prisma.user.findFirst({
        where: {
            email: "admin@example.com"
        }
    })

    if (!exists) {
        const hashedPassword = await hash("admin123", 10)
        await prisma.user.create({
            data: {
                email: "admin@example.com",
                name: "Admin User",
                password: hashedPassword,
                role: "ADMIN"
            }
        })
        console.log("Admin user created successfully!")
    } else {
        console.log("Admin user already exists!")
    }
}

module.exports.seedHouseholds = async function () {
    const householdsCount = await prisma.household.count()

    if (householdsCount === 0) {
        const households = await prisma.household.createMany({
            data: [
                {
                    houseNo: "123",
                    street: "Maharlika Street",
                    barangay: "San Miguel",
                    city: "Manila",
                    province: "Metro Manila",
                    zipCode: "1008",
                    latitude: 14.599512,
                    longitude: 120.984222
                },
                {
                    houseNo: "456",
                    street: "Rizal Avenue",
                    barangay: "San Miguel",
                    city: "Manila",
                    province: "Metro Manila",
                    zipCode: "1008",
                    latitude: 14.599222,
                    longitude: 120.984111
                },
                {
                    houseNo: "789",
                    street: "Mabini Street",
                    barangay: "San Miguel",
                    city: "Manila",
                    province: "Metro Manila",
                    zipCode: "1008",
                    latitude: 14.598999,
                    longitude: 120.984333
                }
            ]
        })
        console.log("Sample households created successfully!")
    } else {
        console.log("Households already exist!")
    }
}

module.exports.seedResidents = async function () {
    const residentsCount = await prisma.resident.count()

    if (residentsCount === 0) {
        // Get the first household for sample data
        const household = await prisma.household.findFirst()

        if (household) {
            await prisma.resident.createMany({
                data: [
                    {
                        firstName: "Juan",
                        middleName: "Dela",
                        lastName: "Cruz",
                        birthDate: new Date("1990-01-15"),
                        gender: "MALE",
                        civilStatus: "MARRIED",
                        contactNo: "09123456789",
                        email: "juan@example.com",
                        occupation: "Teacher",
                        address: `${household.houseNo} ${household.street}`,
                        householdId: household.id
                    },
                    {
                        firstName: "Maria",
                        middleName: "Santos",
                        lastName: "Cruz",
                        birthDate: new Date("1992-03-20"),
                        gender: "FEMALE",
                        civilStatus: "MARRIED",
                        contactNo: "09187654321",
                        email: "maria@example.com",
                        occupation: "Nurse",
                        address: `${household.houseNo} ${household.street}`,
                        householdId: household.id
                    },
                    {
                        firstName: "Pedro",
                        lastName: "Santos",
                        birthDate: new Date("1985-06-10"),
                        gender: "MALE",
                        civilStatus: "SINGLE",
                        contactNo: "09199999999",
                        occupation: "Engineer",
                        address: "321 Independent St",
                    }
                ]
            })
            console.log("Sample residents created successfully!")
        }
    } else {
        console.log("Residents already exist!")
    }
} 