import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { Role, Status } from "@prisma/client"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

interface ExtendedUser {
    id: string
    email: string
    name: string | null
    role: Role
    status: Status
}

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.status = user.status
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role
                session.user.status = token.status
                session.user.id = token.id as string
            }
            return session
        },
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials")
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user || !user.password) {
                    throw new Error("Invalid credentials")
                }

                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    throw new Error("Invalid credentials")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                }
            },
        }),
    ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 