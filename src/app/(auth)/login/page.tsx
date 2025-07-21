"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, MapPin } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check for error from URL
  useEffect(() => {
    const errorFromUrl = searchParams.get("error");
    if (errorFromUrl) {
      if (errorFromUrl === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError(`Authentication error: ${errorFromUrl}`);
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("Login page: User is authenticated, redirecting to", callbackUrl);
      setIsNavigating(true);
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  // Handle navigation state
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    window.addEventListener("beforeunload", handleStart);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting to sign in with credentials, redirect=true");
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: true,
      });

      console.log("SignIn result:", result);
      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-3 border-slate-300 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-white font-medium">Loading dashboard...</p>
        </div>
      )}

      <div className="min-h-screen flex">
        {/* Left Panel - Hero Section */}
        <div className="hidden lg:flex lg:w-3/5 relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-start text-white p-16 max-w-2xl">
            {/* Logo Section */}
            <div className="mb-12">
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 inline-block">
                <Image
                  src="/bisig-logo.jpg"
                  alt="BISIG Logo"
                  width={80}
                  height={80}
                  className="rounded-xl"
                />
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">
                BISIG Management System
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-12">
                Streamlined barangay administration for modern communities. Secure, efficient, and user-friendly.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-slate-600/50 rounded-lg p-3">
                  <Users className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Resident Management</h3>
                  <p className="text-sm text-slate-400">Complete resident database and records</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-slate-600/50 rounded-lg p-3">
                  <Shield className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Secure Platform</h3>
                  <p className="text-sm text-slate-400">Advanced security and data protection</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-slate-600/50 rounded-lg p-3">
                  <MapPin className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Location Services</h3>
                  <p className="text-sm text-slate-400">Geographic mapping and tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center bg-white relative">
          <div className="w-full max-w-md mx-auto p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-xl mb-4">
                <Image
                  src="/bisig-logo.jpg"
                  alt="BISIG Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">BISIG Management</h1>
            </div>

            {/* Login Form */}
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h2>
                <p className="text-slate-600">Access your management dashboard</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Mail size={18} />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10 pr-4 bg-slate-50 border-slate-200 rounded-lg focus:border-slate-400 focus:ring-slate-400/20 transition-colors"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Lock size={18} />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-10 pr-12 bg-slate-50 border-slate-200 rounded-lg focus:border-slate-400 focus:ring-slate-400/20 transition-colors"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center mt-12">
              <p className="text-sm text-slate-500">
                © 2024 BISIG Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
