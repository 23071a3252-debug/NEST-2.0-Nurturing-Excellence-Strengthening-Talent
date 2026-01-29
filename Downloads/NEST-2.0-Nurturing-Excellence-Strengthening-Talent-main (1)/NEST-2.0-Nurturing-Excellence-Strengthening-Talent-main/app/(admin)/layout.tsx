export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="font-semibold mb-4">Admin Navigation</h2>
      </aside>
      <div className="lg:col-span-9">
        {children}
      </div>
    </div>
  );
}
