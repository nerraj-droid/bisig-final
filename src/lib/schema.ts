import { z } from "zod";
import { EmploymentStatus, IdentityType } from "@prisma/client";

export type ResidentFormData = z.infer<typeof residentSchema>;

export const residentSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    birthDate: z.string().min(1, "Birth date is required"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED", "SEPARATED"]),
    contactNo: z.string().optional(),
    email: z.string().email().optional(),
    employmentStatus: z.nativeEnum(EmploymentStatus),
    occupation: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    householdId: z.string().optional(),
    fatherName: z.string().optional(),
    fatherMiddleName: z.string().optional(),
    fatherLastName: z.string().optional(),
    motherFirstName: z.string().optional(),
    motherMiddleName: z.string().optional(),
    motherMaidenName: z.string().optional(),
    identityType: z.nativeEnum(IdentityType).optional(),
    identityNumber: z.string().optional(),
    userPhoto: z.string().optional(),
    nationality: z.string().default("Filipino"),
    religion: z.string().optional(),
    ethnicGroup: z.string().optional(),
    extensionName: z.string().optional(),
    alias: z.string().optional(),
    bloodType: z.string().optional(),
    educationalAttainment: z.string().optional(),
    voterInBarangay: z.boolean().default(false),
    sectors: z.array(z.string()).default([])
}).refine((data) => {
    if (data.employmentStatus === "EMPLOYED" && !data.occupation) {
        return false;
    }
    return true;
}, {
    message: "Occupation is required when employment status is Employed",
    path: ["occupation"]
}).refine((data) => {
    if (data.identityType && !data.identityNumber) {
        return false;
    }
    return true;
}, {
    message: "ID number is required when ID type is selected",
    path: ["identityNumber"]
});

// ... existing code ...