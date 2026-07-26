"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Truck } from "lucide-react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [p, s, pr] = await Promise.all([api.get("/purchases"), api.get("/suppliers"), api.get("/products", { params: { limit: 200 } })]);
    setPurchases(p.data);
    setSuppliers(s.data);
    setProducts(pr.data.data);
  }
  useEffect(() => { load(); }, []);

  function addItem() {
    setItems((i) => [...i, { productId: "", quantity: 1, unitCost: 0 }]);
  }
  function updateItem(idx, field, value) {
    setItems((i) => i.map((it, x) => (x === idx ? { ...it, [field]: value } : it)));
  }
  function removeItem(idx) {
    setItems((i) => i.filter((_, x) => x !== idx));
  }

  async function submit() {
    if (!supplierId || items.length === 0) return toast.error("Select a supplier and add at least one item.");
    try {
      await api.post("/purchases", { supplierId, items, deliveryStatus: "pending" });
      toast.success("Purchase order created.");
      setItems([]);
      setSupplierId("");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create purchase.");
    }
  }

  async function markDelivered(id) {
    try {
      await api.patch(`/purchases/${id}/deliver`);
      toast.success("Marked as delivered — stock updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Purchase Orders</h1>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Purchase Order</button>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-4">
          <div className="max-w-sm">
            <label className="text-xs text-gray-500">Supplier</label>
            <select className="input mt-1" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Select supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
            </select>
          </div>

          {items.map((it, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Product</label>
                <select className="input mt-1" value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="w-28">
                <label className="text-xs text-gray-500">Qty</label>
                <input type="number" className="input mt-1" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
              </div>
              <div className="w-32">
                <label className="text-xs text-gray-500">Unit Cost</label>
                <input type="number" step="0.01" className="input mt-1" value={it.unitCost} onChange={(e) => updateItem(idx, "unitCost", Number(e.target.value))} />
              </div>
              <button onClick={() => removeItem(idx)} className="text-red-500 p-2"><Trash2 size={16} /></button>
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={addItem} className="btn-secondary">+ Add Line Item</button>
            <button onClick={submit} className="btn-primary">Create Purchase Order</button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table w-full">
          <thead><tr><th>PO #</th><th>Supplier</th><th>Total Cost</th><th>Payment</th><th>Delivery</th><th>Actions</th></tr></thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>{p.purchaseNumber}</td>
                <td>{p.Supplier?.companyName || "—"}</td>
                <td>GH₵ {Number(p.totalCost).toFixed(2)}</td>
                <td className="capitalize">{p.paymentStatus}</td>
                <td className="capitalize">{p.deliveryStatus}</td>
                <td>
                  {p.deliveryStatus !== "delivered" && (
                    <button onClick={() => markDelivered(p.id)} className="btn-secondary text-xs flex items-center gap-1">
                      <Truck size={13} /> Mark Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
