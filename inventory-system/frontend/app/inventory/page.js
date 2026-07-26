"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Plus, Search, Trash2, Copy, Pencil } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  async function load() {
    const params = {};
    if (search) params.search = search;
    if (stockStatus) params.stockStatus = stockStatus;
    const { data } = await api.get("/products", { params });
    setProducts(data.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [search, stockStatus]);

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    }
  }

  async function duplicate(id) {
    try {
      await api.post(`/products/${id}/duplicate`);
      toast.success("Product duplicated.");
      load();
    } catch (err) {
      toast.error("Failed to duplicate.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <Link href="/inventory/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 input flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            className="bg-transparent outline-none w-full"
            placeholder="Search by name, code, barcode, supplier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input max-w-xs" value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
          <option value="">All stock statuses</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Product</th><th>Code</th><th>Category</th><th>Qty</th><th>Purchase</th><th>Selling</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.name}</td>
                <td>{p.productCode}</td>
                <td>{p.Category?.name || "—"}</td>
                <td className={p.quantity === 0 ? "text-red-500" : p.quantity <= p.minStockThreshold ? "text-amber-500" : ""}>
                  {p.quantity}
                </td>
                <td>GH₵ {Number(p.purchasePrice).toFixed(2)}</td>
                <td>GH₵ {Number(p.sellingPrice).toFixed(2)}</td>
                <td className="capitalize">{p.status}</td>
                <td>
                  <div className="flex gap-2">
                    <Link href={`/inventory/${p.id}`} className="p-1 hover:text-brand-600" title="View / Edit"><Pencil size={15} /></Link>
                    <button onClick={() => duplicate(p.id)} className="p-1 hover:text-brand-600" title="Duplicate"><Copy size={15} /></button>
                    <button onClick={() => remove(p.id)} className="p-1 hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-6">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedRoute>
  );
}
