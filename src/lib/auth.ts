import { PrismaClient, Role, Status } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

type UserStatus = "ACTIVE" | "INACTIVE";

interface DefaultUser {
  email: string;
  name: string;
  password: string;
  role: Role;
}

// Export the auth utilities separately from authOptions
export const authUtils = {
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
          id: randomUUID(),
          email: "admin@example.com",
          name: "Super Admin",
          password: hashedPassword,
          role: Role.SUPER_ADMIN,
          updatedAt: new Date(),
          status: Status.ACTIVE,
        },
      });
      console.log("Super Admin user created successfully!");

      // Create other default users
      const defaultUsers: DefaultUser[] = [
        {
          email: "captain@example.com",
          name: "Barangay Captain",
          password: "captain123",
          role: Role.CAPTAIN,
        },
        {
          email: "secretary@example.com",
          name: "Barangay Secretary",
          password: "secretary123",
          role: Role.SECRETARY,
        },
        {
          email: "treasurer@example.com",
          name: "Barangay Treasurer",
          password: "treasurer123",
          role: Role.TREASURER,
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
            status: Status.ACTIVE,
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
              address: `${household.houseNo} ${household.street}`,
              householdId: household.id,
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
              address: `${household.houseNo} ${household.street}`,
              householdId: household.id,
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
              address: "321 Independent St",
              updatedAt: new Date(),
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

// Default export for backward compatibility
export default authUtils;
