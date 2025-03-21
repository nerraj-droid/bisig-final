"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg p-6 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="rounded-md bg-red-50 p-4 text-red-500">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-md border-0 p-2"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border-0 p-2"
                placeholder="Password"
              />
            </div>
          </div>

<<<<<<< Updated upstream
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Sign in
            </button>
=======
        {/* Right side - Login form */}
        <div className="flex-1 flex items-center justify-center bg-white relative">
          <div className="w-full max-w-md px-8 py-12 relative">
            {/* Logo at the top */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 border-2 border-[#F39C12]">
              <div className="w-16 h-16 flex items-center justify-center">
                <p className="text-[#006B5E] font-bold text-sm text-center">YOUR LOGO HERE</p>
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h1 className="text-3xl font-bold text-[#006B5E]">WELCOME!</h1>
              <p className="text-[#006B5E]">Please Log in to your Account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#E8E8E8] border-none h-12 rounded-md"
                  placeholder="Email"
                  required
                  disabled={isLoading}
                />

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#E8E8E8] border-none h-12 rounded-md pr-10"
                    placeholder="Password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#006B5E] hover:bg-[#005046] text-white h-12 rounded-full relative overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "LOGIN"
                )}
              </Button>

              {/* <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="bg-white px-3 text-gray-500 text-sm">or</span>
                <div className="border-t border-gray-300 w-full"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border border-gray-300 h-12 rounded-full flex items-center justify-center gap-2"
                onClick={() => {
                  setIsNavigating(true);
                  signIn("google", { callbackUrl: "/dashboard" });
                }}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.64 0 3.1.56 4.25 1.64l3.18-3.18C17.56 1.89 14.96 1 12 1 7.31 1 3.26 3.7 1.28 7.54l3.7 2.86c.87-2.6 3.3-4.36 7.02-4.36z"
                  />
                  <path
                    fill="#34A853"
                    d="M23 12c0-.87-.14-1.72-.38-2.5H12v4.17h6.2c-.27 1.38-1.07 2.54-2.28 3.32l3.58 2.77c2.1-1.94 3.5-4.8 3.5-8.26z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M4.98 14.6l-3.7 2.86C2.92 20.18 7.08 23 12 23c2.96 0 5.56-.9 7.43-2.43l-3.58-2.77c-.99.66-2.24 1.06-3.85 1.06-3.72 0-6.15-1.77-7.02-4.36z"
                  />
                  <path
                    fill="#4285F4"
                    d="M12 5.04c2.15 0 3.98.74 5.45 2.14l3.18-3.18C18.76 2.23 15.7 1 12 1 7.31 1 3.26 3.7 1.28 7.54l3.7 2.86C5.85 7.8 8.28 5.04 12 5.04z"
                  />
                </svg>
                <span>Google</span>
              </Button> */}

              <div className="mt-6 text-center">
                <a href="#" className="text-sm text-[#006B5E] hover:underline">
                  Forgot password?
                </a>
              </div>
            </form>
>>>>>>> Stashed changes
          </div>
        </form>
      </div>
    </div>
  );
}
