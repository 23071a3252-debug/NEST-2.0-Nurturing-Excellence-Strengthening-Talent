import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Card from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <LoadingSpinner text="Loading task details..." />
      </Card>
    </div>
  );
}
