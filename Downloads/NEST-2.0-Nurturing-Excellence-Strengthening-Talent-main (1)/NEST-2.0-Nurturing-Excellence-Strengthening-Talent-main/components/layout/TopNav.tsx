"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function TopNav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Don't show nav on auth pages
  if (pathname === "/login" || pathname === "/verify-otp") {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/doctor") {
      return pathname === "/doctor" || pathname?.startsWith("/tasks") || pathname?.startsWith("/doctor/reports");
    }
    if (path === "/pv") {
      return pathname === "/pv" || pathname?.startsWith("/cases");
    }
    if (path === "/patient") {
      return pathname === "/patient";
    }
    if (path === "/report") {
      return pathname === "/report";
    }
    return pathname?.startsWith(path);
  };
  
  const handleDemoReset = async () => {
    try {
      // Call the reset API endpoint
      const response = await fetch('/api/dev/reset', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Clear localStorage drafts
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        setShowResetConfirm(false);
        // Redirect to login after clearing session
        window.location.href = "/login";
      } else {
        console.error('Failed to reset database');
        alert('Failed to reset demo data. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting demo:', error);
      alert('Error resetting demo data. Please try again.');
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                PharmaVigil
              </Link>
              
              {user && (
                <div className="hidden md:flex space-x-4">
                  {(user.role === "DOCTOR") && (
                    <Link
                      href="/doctor"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/doctor")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      My Tasks
                    </Link>
                  )}
                  
                  {(user.role === "PATIENT") && (
                    <>
                      <Link
                        href="/patient"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/patient")
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        My Reports
                      </Link>
                      <Link
                        href="/report"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/report")
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        Report a Problem
                      </Link>
                    </>
                  )}
                  
                  {(user.role === "PV_OFFICER" || user.role === "SAFETY_LEAD") && (
                    <Link
                      href="/pv"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/pv")
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      PV Dashboard
                    </Link>
                  )}
                  
                  {user.role === "ADMIN" && (
                    <>
                      <Link
                        href="/admin"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/admin")
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        Admin
                      </Link>
                      <Link
                        href="/pv"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive("/pv")
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        Cases
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  title="Reset demo data"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Demo
                </button>
              )}

              {user ? (
                <>
                  <div className="hidden sm:block text-right border-l border-gray-200 dark:border-gray-700 pl-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.role.replace("_", " ")}
                    </p>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reset Demo Data?
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will reset all demo data including MongoDB reports, GridFS images, tasks, submissions, audit logs, and drafts. You will be logged out and redirected to the login page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDemoReset}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
