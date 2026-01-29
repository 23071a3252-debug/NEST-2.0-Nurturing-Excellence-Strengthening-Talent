"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { verifyOTP } from "@/lib/auth/session";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get identifier from session storage
    const storedIdentifier = sessionStorage.getItem("otp_identifier");
    if (!storedIdentifier) {
      router.push("/login");
      return;
    }
    setIdentifier(storedIdentifier);

    // Focus first input
    inputRefs.current[0]?.focus();
  }, [router]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every((digit) => digit)) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      
      // Auto-submit
      setTimeout(() => handleVerify(pastedData), 100);
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const otpString = otpValue || otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyOTP(identifier, otpString);

      if (result.success && result.user) {
        // Clear session storage
        sessionStorage.removeItem("otp_identifier");

        // Redirect based on role (use window.location to force full page reload)
        // This ensures AuthProvider loads the new session properly
        let redirectUrl = "/";
        switch (result.user.role) {
          case "PATIENT":
            redirectUrl = "/patient";
            break;
          case "DOCTOR":
            redirectUrl = "/doctor";
            break;
          case "PV_OFFICER":
          case "SAFETY_LEAD":
            redirectUrl = "/pv";
            break;
          case "ADMIN":
            redirectUrl = "/admin";
            break;
        }
        
        // Use window.location.href for hard redirect to ensure fresh state
        window.location.href = redirectUrl;
      } else {
        setError(result.message);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // In production, call requestOTP again
    alert(`OTP resent to ${identifier}\nUse: 123456`);
  };

  const maskIdentifier = (id: string) => {
    if (id.includes("@")) {
      const [name, domain] = id.split("@");
      return `${name.substring(0, 2)}***@${domain}`;
    }
    return `***${id.slice(-4)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verify OTP
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to
          </p>
          <p className="text-gray-900 dark:text-white font-medium mt-1">
            {identifier ? maskIdentifier(identifier) : "..."}
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                One-Time Password
              </label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    autoComplete="off"
                  />
                ))}
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                For MVP Testing:
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Use OTP: <span className="font-mono font-bold">123456</span>
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => handleVerify()}
              disabled={loading || otp.some((d) => !d)}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
              
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  disabled={loading}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
