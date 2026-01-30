"use client";

import Card from "@/components/ui/Card";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  color: "purple" | "blue" | "orange" | "red";
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  color,
  icon,
}: StatCardProps) {
  const colorClasses = {
    purple: {
      border: "border-l-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/10",
      light: "bg-purple-100/50 dark:bg-purple-900/20",
    },
    blue: {
      border: "border-l-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      light: "bg-blue-100/50 dark:bg-blue-900/20",
    },
    orange: {
      border: "border-l-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/10",
      light: "bg-orange-100/50 dark:bg-orange-900/20",
    },
    red: {
      border: "border-l-red-500",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/10",
      light: "bg-red-100/50 dark:bg-red-900/20",
    },
  };

  const classes = colorClasses[color];

  return (
    <Card className={`border-l-4 ${classes.border} ${classes.bg} p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className={`text-5xl font-bold ${classes.text}`}>{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-3">
            {description}
          </p>
        </div>
        {icon && (
          <div className={`ml-4 p-3 rounded-lg ${classes.light}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
