// app/admin/dashboard/page.tsx
// Server wrapper that always renders the client; the client will fetch with cookies.

import { AdminDashboardClient } from "./_components/admin-dashboard-client";


export default async function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {/* Do not gate on session here; the client will verify via API */}
      <AdminDashboardClient />
    </div>
  );
}
