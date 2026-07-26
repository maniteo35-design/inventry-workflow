"use client";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="card max-w-2xl space-y-3 text-sm text-gray-600 dark:text-gray-300">
        <p>This page is a placeholder for company info, tax rates, currency, receipt templates, and warehouse
        configuration. Wire it up to a <code>Settings</code> model + <code>/api/settings</code> endpoint (GET/PUT)
        following the same controller/route pattern used for Suppliers.</p>
        <p>User management (creating Admin/Manager/Salesperson/Inventory Officer accounts) can reuse
        <code> POST /api/auth/register</code>, gated to super_admin only in production.</p>
      </div>
    </ProtectedRoute>
  );
}
