import { Role, Status } from "@prisma/client"
import "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface User {
        role: Role
        status: Status
    }

    interface Session {
        user: {
            role: Role
            status: Status
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role
        status: Status
    }
} 