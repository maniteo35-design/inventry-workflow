"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await api.get("/customers");
    setCustomers(data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/customers", form);
      toast.success("Customer added.");
      setForm({ name: "", phone: "", email: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error("Failed to add customer.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Customer</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div><label className="text-xs text-gray-500">Name *</label><input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-xs text-gray-500">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="text-xs text-gray-500">Email</label><input className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <button className="btn-primary">Save</button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table w-full">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Loyalty Points</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.email || "—"}</td>
                <td>{c.loyaltyPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
