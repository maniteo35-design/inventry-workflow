"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const { name, purchasePrice, sellingPrice, quantity, minStockThreshold, description, status } = product;
      await api.put(`/products/${id}`, { name, purchasePrice, sellingPrice, quantity, minStockThreshold, description, status });
      toast.success("Product updated.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  }

  function update(field, value) {
    setProduct((p) => ({ ...p, [field]: value }));
  }

  if (!product) return <ProtectedRoute><p className="text-sm text-gray-400">Loading…</p></ProtectedRoute>;

  const margin = product.sellingPrice - product.purchasePrice;
  const marginPct = product.sellingPrice ? ((margin / product.sellingPrice) * 100).toFixed(1) : 0;

  return (
    <ProtectedRoute>
      <button onClick={() => router.push("/inventory")} className="text-sm text-brand-600 mb-4">&larr; Back to inventory</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 space-y-4">
          <h1 className="text-xl font-semibold">{product.name}</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <input className="input mt-1" value={product.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select className="input mt-1" value={product.status} onChange={(e) => update("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Purchase Price</label>
              <input type="number" step="0.01" className="input mt-1" value={product.purchasePrice} onChange={(e) => update("purchasePrice", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Selling Price</label>
              <input type="number" step="0.01" className="input mt-1" value={product.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Quantity</label>
              <input type="number" className="input mt-1" value={product.quantity} onChange={(e) => update("quantity", e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Low Stock Threshold</label>
              <input type="number" className="input mt-1" value={product.minStockThreshold} onChange={(e) => update("minStockThreshold", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Description</label>
            <textarea className="input mt-1" rows={3} value={product.description || ""} onChange={(e) => update("description", e.target.value)} />
          </div>
          <button disabled={saving} onClick={save} className="btn-primary">{saving ? "Saving…" : "Save Changes"}</button>
        </div>

        <div className="space-y-6">
          <div className="card text-center">
            {product.qrCode && <img src={product.qrCode} alt="QR code" className="mx-auto w-32 h-32" />}
            <p className="text-xs text-gray-400 mt-2">Barcode: {product.barcode}</p>
            <p className="text-xs text-gray-400">Code: {product.productCode}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={() => window.print()} className="btn-secondary text-xs">Print QR/Barcode</button>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-2 text-sm">Profit Margin</h2>
            <p className="text-2xl font-semibold">GH₵ {margin.toFixed(2)} <span className="text-sm text-gray-400">({marginPct}%)</span></p>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-2 text-sm">Stock Movement Timeline</h2>
            <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
              {product.StockMovements?.map((m) => (
                <li key={m.id} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                  <span className="capitalize">{m.type.replace("_", " ")}</span>
                  <span className={m.quantityChange < 0 ? "text-red-500" : "text-green-600"}>
                    {m.quantityChange > 0 ? "+" : ""}{m.quantityChange}
                  </span>
                </li>
              ))}
              {(!product.StockMovements || product.StockMovements.length === 0) && (
                <li className="text-gray-400">No movements recorded yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
