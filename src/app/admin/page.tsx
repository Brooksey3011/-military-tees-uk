import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminNavbar } from '@/components/admin/admin-navbar';

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">Products</h2>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">Orders</h2>
              <p className="text-muted-foreground">View and manage orders</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">Customers</h2>
              <p className="text-muted-foreground">Customer management</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">Analytics</h2>
              <p className="text-muted-foreground">Business insights</p>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}