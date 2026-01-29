import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Card from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      
      <Card>
        <LoadingSpinner text="Loading your tasks..." />
      </Card>
    </div>
  );
}
