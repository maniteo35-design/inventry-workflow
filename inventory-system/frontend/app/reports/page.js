"use client";
import { useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import toast from "react-hot-toast";

const REPORTS = [
  { key: "sales", label: "Sales Report", csv: true },
  { key: "profit", label: "Profit Report", csv: false },
  { key: "stock", label: "Stock Report", csv: true },
  { key: "purchases", label: "Purchase Report", csv: false },
  { key: "inventory-valuation", label: "Inventory Valuation", csv: false },
];

export default function ReportsPage() {
  const [active, setActive] = useState("sales");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run(key) {
    setActive(key);
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/${key}`);
      setData(data);
    } catch (err) {
      toast.error("Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadCsv(key) {
    try {
      const res = await api.get(`/reports/${key}`, { params: { format: "csv" }, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}_report.csv`;
      a.click();
    } catch (err) {
      toast.error("Failed to export CSV.");
    }
  }

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => run(r.key)}
            className={active === r.key ? "btn-primary" : "btn-secondary"}
          >
            {r.label}
          </button>
        ))}
      </div>

      {REPORTS.find((r) => r.key === active)?.csv && (
        <button onClick={() => downloadCsv(active)} className="btn-secondary mb-4 text-xs">Export CSV</button>
      )}

      <div className="card">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{data ? JSON.stringify(data, null, 2) : "Select a report above."}</pre>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        This raw JSON view is a starting point — swap in formatted tables/charts per report as needed. PDF/Excel export
        can be added the same way as CSV using a library like `pdfkit` or `exceljs` on the backend.
      </p>
    </ProtectedRoute>
  );
}
