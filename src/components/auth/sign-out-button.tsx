"use client"

import { signOut } from "next-auth/react"
import { Slot } from "@radix-ui/react-slot"
import { forwardRef } from "react"

interface SignOutButtonProps {
  children?: React.ReactNode
  asChild?: boolean
}

export const SignOutButton = forwardRef<HTMLButtonElement, SignOutButtonProps>(
  ({ children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        onClick={() => signOut({ callbackUrl: "/login" })}
        {...props}
      >
        {children || "Sign Out"}
      </Comp>
    )
  }
)

SignOutButton.displayName = "SignOutButton" 