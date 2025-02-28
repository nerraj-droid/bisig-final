const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

type UserStatus = "ACTIVE" | "INACTIVE";

interface DefaultUser {
  email: string;
  name: string;
  password: string;
  role: string;
}

const auth = {
  async createAdminUser() {
    const exists = await prisma.user.findFirst({
      where: {
        email: "admin@example.com",
      },
    });

    if (!exists) {
      const hashedPassword = await hash("admin123", 10);
      await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Super Admin",
          password: hashedPassword,
          role: "SUPER_ADMIN",
        },
      });
      console.log("Super Admin user created successfully!");

      // Create other default users
      const defaultUsers: DefaultUser[] = [
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
            email: user.email,
            name: user.name,
            password: hashedPassword,
            role: user.role,
          },
        });
        console.log(`${user.role} user created successfully!`);
      }
    } else {
      console.log("Admin user already exists!");
    }
  },

  async seedHouseholds() {
    const householdsCount = await prisma.household.count();

    if (householdsCount === 0) {
      await prisma.household.createMany({
        data: [
          {
            houseNo: "123",
            street: "Main Street",
            barangay: "Sample Barangay",
            city: "Sample City",
            province: "Sample Province",
            zipCode: "1234",
            latitude: 14.5995,
            longitude: 120.9842,
          },
          {
            houseNo: "456",
            street: "Secondary Street",
            barangay: "Sample Barangay",
            city: "Sample City",
            province: "Sample Province",
            zipCode: "1234",
            latitude: 14.6005,
            longitude: 120.9852,
          },
        ],
      });
      console.log("Sample households created successfully!");
    } else {
      console.log("Households already exist!");
    }
  },

  async seedResidents() {
    const residentsCount = await prisma.resident.count();

    if (residentsCount === 0) {
      // Get the first household for sample data
      const household = await prisma.household.findFirst();

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
              householdId: household.id,
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
              householdId: household.id,
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
            },
          ],
        });
        console.log("Sample residents created successfully!");
      }
    } else {
      console.log("Residents already exist!");
    }
  },
};

module.exports = auth;
