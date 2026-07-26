"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Trash2, Plus, Minus } from "lucide-react";

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]); // {product, quantity}
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/customers").then((r) => setCustomers(r.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) {
        api.get("/products", { params: { search, limit: 8 } }).then((r) => setResults(r.data.data));
      } else {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  function addToCart(product) {
    setCart((c) => {
      const existing = c.find((i) => i.product.id === product.id);
      if (existing) {
        return c.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...c, { product, quantity: 1 }];
    });
    setSearch("");
    setResults([]);
  }

  function changeQty(id, delta) {
    setCart((c) =>
      c.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  }

  function removeItem(id) {
    setCart((c) => c.filter((i) => i.product.id !== id));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.sellingPrice * i.quantity, 0);
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + tax;

  async function checkout(status = "completed") {
    if (cart.length === 0) return toast.error("Cart is empty.");
    setSubmitting(true);
    try {
      const { data } = await api.post("/sales", {
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        customerId: customerId || null,
        discount: Number(discount),
        taxRate: Number(taxRate),
        paymentMethod,
        status,
      });
      toast.success(status === "held" ? "Sale held." : `Sale completed — ${data.invoiceNumber}`);
      setCart([]);
      setDiscount(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Point of Sale</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card relative">
            <input
              className="input"
              placeholder="Scan barcode or search product by name / code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {results.length > 0 && (
              <div className="absolute z-10 left-5 right-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg mt-1 shadow-lg max-h-72 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex justify-between w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                  >
                    <span>{p.name} <span className="text-gray-400">({p.quantity} in stock)</span></span>
                    <span>GH₵ {Number(p.sellingPrice).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <table className="data-table w-full">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line Total</th><th></th></tr></thead>
              <tbody>
                {cart.map((i) => (
                  <tr key={i.product.id}>
                    <td>{i.product.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(i.product.id, -1)} className="p-1 bg-gray-100 dark:bg-gray-800 rounded"><Minus size={12} /></button>
                        {i.quantity}
                        <button onClick={() => changeQty(i.product.id, 1)} className="p-1 bg-gray-100 dark:bg-gray-800 rounded"><Plus size={12} /></button>
                      </div>
                    </td>
                    <td>GH₵ {Number(i.product.sellingPrice).toFixed(2)}</td>
                    <td>GH₵ {(i.product.sellingPrice * i.quantity).toFixed(2)}</td>
                    <td><button onClick={() => removeItem(i.product.id)} className="text-red-500"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
                {cart.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-6">Cart is empty. Search above to add products.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card h-fit space-y-3">
          <div>
            <label className="text-xs text-gray-500">Customer</label>
            <select className="input mt-1" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Walk-in customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Discount (GH₵)</label>
              <input type="number" className="input mt-1" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tax (%)</label>
              <input type="number" className="input mt-1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Payment Method</label>
            <select className="input mt-1" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="split">Split Payment</option>
            </select>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>GH₵ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>- GH₵ {Number(discount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>GH₵ {tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span>GH₵ {total.toFixed(2)}</span></div>
          </div>

          <div className="flex gap-2 pt-2">
            <button disabled={submitting} onClick={() => checkout("completed")} className="btn-primary flex-1">Charge</button>
            <button disabled={submitting} onClick={() => checkout("held")} className="btn-secondary">Hold</button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
