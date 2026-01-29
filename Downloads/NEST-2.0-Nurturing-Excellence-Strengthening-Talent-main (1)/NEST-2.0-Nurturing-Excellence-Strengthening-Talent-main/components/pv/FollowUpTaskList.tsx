/**
 * PV Follow-Up Task Management Component
 * Display and manage follow-up tasks for a case
 */

"use client";

import { PVFollowUpTask } from "@/types/pv";
import Card from "@/components/ui/Card";
import { useState } from "react";

interface PVFollowUpTaskListProps {
  tasks: PVFollowUpTask[];
  caseId: string;
  onTaskUpdate?: (taskId: string) => void;
}

export function PVFollowUpTaskList({ tasks, caseId, onTaskUpdate }: PVFollowUpTaskListProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      case "SENT":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "IN_PROGRESS":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "OVERDUE":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      case "CANCELLED":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      case "P1":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
      case "P2":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (task: PVFollowUpTask) => {
    return task.status === "PENDING" && new Date(task.dueDate) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No follow-up tasks created yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task._id?.toString()}
          className={`cursor-pointer border-l-4 transition-all ${
            selectedTask === task._id?.toString()
              ? "border-l-purple-500 bg-purple-50 dark:bg-purple-900/10"
              : "border-l-gray-400 hover:border-l-purple-500"
          }`}
          onClick={() => setSelectedTask(selectedTask === task._id?.toString() ? null : task._id?.toString())}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {task.title}
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                {isOverdue(task) && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                    OVERDUE
                  </span>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>Due: {formatDate(task.dueDate)}</span>
                {task.requiredFields && task.requiredFields.length > 0 && (
                  <span>{task.requiredFields.length} field(s) requested</span>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {selectedTask === task._id?.toString() && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {task.requiredFields && task.requiredFields.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Required Fields:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.requiredFields.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.doctorResponse && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Doctor Response:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm space-y-2">
                    {task.doctorResponse.additionalNotes && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {task.doctorResponse.additionalNotes}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Submitted on {formatDate(task.doctorResponse.submittedAt)}
                    </p>
                  </div>
                </div>
              )}

              {!task.doctorResponse && task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded text-sm text-yellow-800 dark:text-yellow-300">
                  Awaiting response from doctor...
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
