"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError("Something went wrong: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0F1C]">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-[45%] bg-[#0A0F1C] p-8 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E2A45] via-[#0A0F1C] to-[#0A0F1C]" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div>
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <Image
                  src="/bisig-logo.jpg"
                  alt="BISIG Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <h1 className="text-xl font-semibold text-[#F8FAFC]">BISIG</h1>
              </div>
              <div className="h-8 w-[1px] bg-[#334155] mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#1E293B] border-2 border-[#334155] flex items-center justify-center text-[#94A3B8]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-[#F8FAFC]">[Barangay Name]</h1>
                  <p className="text-xs text-[#94A3B8]">Management System</p>
                </div>
              </div>
            </div>
            <h2 className="text-2xl text-[#F8FAFC] mb-2">Please Enter your Account details</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-[#94A3B8] mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  placeholder="johndoe@gmail.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-[#94A3B8] mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  placeholder="••••••••"
                />
                <Link href="/forgot-password" className="block text-sm text-[#3B82F6] hover:text-[#2563EB] mt-2">
                  Forgot Password
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-[#F8FAFC] py-6 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#334155]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0A0F1C] text-[#64748B]">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-center">
                <button className="flex items-center justify-center w-10 h-10 rounded-full border border-[#334155] hover:bg-[#1E293B] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" className="text-[#94A3B8]" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-full border border-[#334155] hover:bg-[#1E293B] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" className="text-[#94A3B8]" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-full border border-[#334155] hover:bg-[#1E293B] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" className="text-[#94A3B8]" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-center text-sm text-[#64748B]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#3B82F6] hover:text-[#2563EB]">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Testimonial */}
      <div className="hidden md:flex flex-1 bg-[#1E40AF] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2563EB] via-[#1E40AF] to-[#1E3A8A]" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-[#F8FAFC]">
          <h2 className="text-4xl font-bold mb-6">What our Users Said.</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <p className="text-lg mb-6">
              "Managing barangay records and certificates has never been easier. The system streamlines our daily operations and helps us serve our community better."
            </p>
            <div>
              <p className="font-semibold">Brgy. Captain Jose Santos</p>
              <p className="text-[#BFDBFE]">Barangay Administrator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
