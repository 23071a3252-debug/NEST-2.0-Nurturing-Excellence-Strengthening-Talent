"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { requestOTP } from "@/lib/auth/session";
import { validateEmail } from "@/lib/validators";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmail = (value: string) => value.includes("@");
  const isPhone = (value: string) => /^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!identifier.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    const trimmedId = identifier.trim();

    if (isEmail(trimmedId)) {
      if (!validateEmail(trimmedId)) {
        setError("Please enter a valid email address");
        return;
      }
    } else if (!isPhone(trimmedId)) {
      setError("Please enter a valid phone number (e.g., +1234567890)");
      return;
    }

    setLoading(true);

    try {
      const result = await requestOTP(trimmedId);

      if (result.success) {
        // Store identifier in session storage for OTP verification
        sessionStorage.setItem("otp_identifier", trimmedId);
        
        // Navigate to OTP page
        router.push("/verify-otp");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to NEst
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pharmacovigilance Follow-up System
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Sign In
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter your email or phone number to receive a one-time password
              </p>
            </div>

            <Input
              type="text"
              label="Email or Phone Number"
              placeholder="doctor@test.com or +1234567890"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={error}
              disabled={loading}
              autoComplete="username"
              autoFocus
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                Demo Accounts:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• patient@demo.com (Patient)</li>
                <li>• doctor@demo.com (Doctor)</li>
                <li>• pv@demo.com (PV Officer)</li>
                <li>• safety@demo.com (Safety Lead)</li>
                <li>• admin@demo.com (Admin)</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                OTP for all: 123456
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Continue with OTP"}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
