"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    supplierId: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
    unit: "pcs",
    minStockThreshold: 5,
    expiryDate: "",
    manufactureDate: "",
    shelfNumber: "",
    description: "",
    productType: "physical",
    status: "active",
  });

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
    api.get("/suppliers").then((r) => setSuppliers(r.data));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e, andNew = false) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/products", form);
      toast.success("Product saved.");
      if (andNew) {
        setForm({ ...form, name: "", description: "", quantity: "" });
      } else {
        router.push("/inventory");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Add New Stock</h1>
      <form className="card grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        <div>
          <label className="text-xs text-gray-500">Product Name *</label>
          <input required className="input mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Category</label>
          <select className="input mt-1" value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Supplier</label>
          <select className="input mt-1" value={form.supplierId} onChange={(e) => update("supplierId", e.target.value)}>
            <option value="">Select supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Product Type</label>
          <select className="input mt-1" value={form.productType} onChange={(e) => update("productType", e.target.value)}>
            {["physical", "digital", "perishable", "non_perishable", "raw_material", "finished_goods", "consumable", "spare_part"].map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Purchase Price *</label>
          <input required type="number" step="0.01" className="input mt-1" value={form.purchasePrice} onChange={(e) => update("purchasePrice", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Selling Price *</label>
          <input required type="number" step="0.01" className="input mt-1" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Quantity *</label>
          <input required type="number" className="input mt-1" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Unit</label>
          <input className="input mt-1" value={form.unit} onChange={(e) => update("unit", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Low Stock Threshold</label>
          <input type="number" className="input mt-1" value={form.minStockThreshold} onChange={(e) => update("minStockThreshold", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Shelf Number</label>
          <input className="input mt-1" value={form.shelfNumber} onChange={(e) => update("shelfNumber", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Manufacture Date</label>
          <input type="date" className="input mt-1" value={form.manufactureDate} onChange={(e) => update("manufactureDate", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Expiry Date</label>
          <input type="date" className="input mt-1" value={form.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Description</label>
          <textarea className="input mt-1" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <p className="md:col-span-2 text-xs text-gray-400">
          Product code, barcode, and QR code are generated automatically on save (editable afterward from the product detail page).
          Multi-image upload wires up to your storage provider (Cloudinary/local) — see README for the upload endpoint stub.
        </p>
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button disabled={saving} onClick={(e) => submit(e, false)} className="btn-primary">Save</button>
          <button disabled={saving} onClick={(e) => submit(e, true)} className="btn-secondary">Save &amp; New</button>
          <button type="button" onClick={() => router.push("/inventory")} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </ProtectedRoute>
  );
}
