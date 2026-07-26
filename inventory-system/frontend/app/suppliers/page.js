"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ companyName: "", contactPerson: "", phone: "", email: "", address: "" });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await api.get("/suppliers");
    setSuppliers(data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/suppliers", form);
      toast.success("Supplier added.");
      setForm({ companyName: "", contactPerson: "", phone: "", email: "", address: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error("Failed to add supplier.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Supplier</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div><label className="text-xs text-gray-500">Company *</label><input required className="input mt-1" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
          <div><label className="text-xs text-gray-500">Contact Person</label><input className="input mt-1" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
          <div><label className="text-xs text-gray-500">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="text-xs text-gray-500">Email</label><input className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <button className="btn-primary">Save</button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table w-full">
          <thead><tr><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.companyName}</td>
                <td>{s.contactPerson || "—"}</td>
                <td>{s.phone || "—"}</td>
                <td>{s.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
