"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <div>
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome, {user?.name}. Manage users and system configuration here.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">4</p>
          </div>
          
          <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-100 mb-2">Active Sessions</h3>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">1</p>
          </div>
          
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2">System Health</h3>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">✓ Good</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
