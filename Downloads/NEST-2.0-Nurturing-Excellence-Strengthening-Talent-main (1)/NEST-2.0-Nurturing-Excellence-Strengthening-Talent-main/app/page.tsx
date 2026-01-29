"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case "DOCTOR":
        return "/doctor";
      case "PV_OFFICER":
      case "SAFETY_LEAD":
        return "/pv";
      case "ADMIN":
        return "/admin";
      default:
        return "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        Welcome to NEst
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl">
        Pharmacovigilance Follow-up System
        <br />
        Next.js 14+ with App Router, TypeScript, and TailwindCSS
      </p>

      {user ? (
        <div className="text-center space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Logged in as <span className="font-semibold">{user.name}</span>
          </p>
          <Link href={getDashboardLink()}>
            <Button variant="primary" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            For Doctors
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete follow-up tasks, submit responses, and track patient outcomes efficiently.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            For PV Officers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage cases, assign tasks, review submissions, and ensure compliance.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            For Admins
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure system settings, manage users, and monitor overall performance.
          </p>
        </div>
      </div>
    </div>
  );
}
