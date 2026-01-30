"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";

interface FilterBarProps {
  onSearchChange?: (value: string) => void;
  onStatusChange?: (status: string) => void;
  onSeverityChange?: (severity: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  onSearchChange,
  onStatusChange,
  onSeverityChange,
  searchPlaceholder = "Medicine name or Case ID...",
}: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [severity, setSeverity] = useState("All Severities");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange?.(value);
  };

  const handleSeverityChange = (value: string) => {
    setSeverity(value);
    onSeverityChange?.(value);
  };

  return (
    <Card className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/30 border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Filters
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Search and filter cases by name, status, and severity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Search Cases
          </label>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          >
            <option>All Statuses</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="NEEDS_FOLLOWUP">Needs Follow-up</option>
            <option value="FOLLOWUP_REQUESTED">Follow-up Requested</option>
            <option value="COMPLETED">Completed</option>
            <option value="EXPORTED">Exported</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          >
            <option>All Severities</option>
            <option value="MILD">Mild</option>
            <option value="MODERATE">Moderate</option>
            <option value="SEVERE">Severe</option>
          </select>
        </div>
      </div>
    </Card>
  );
}
