import { Role, Status } from "@prisma/client"
import "next-auth"
import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface User {
        id: string
        role: Role
        status: Status
    }

    interface Session {
        user: {
            id: string
            role: Role
            status: Status
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
        status: Status
    }
} 