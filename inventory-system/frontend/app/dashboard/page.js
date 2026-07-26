"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import StatCard from "../../components/StatCard";
import api from "../../lib/api";
import { Package, Layers, AlertTriangle, XCircle, DollarSign, TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    api.get("/dashboard/summary").then((r) => setSummary(r.data)).catch(() => {});
    api.get("/dashboard/sales-chart?days=14").then((r) => setChart(r.data)).catch(() => {});
  }, []);

  const chartData = {
    labels: chart.map((c) => c.date),
    datasets: [
      {
        label: "Sales",
        data: chart.map((c) => c.total),
        borderColor: "#3b6df0",
        backgroundColor: "rgba(59,109,240,0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <ProtectedRoute>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {!summary ? (
        <p className="text-sm text-gray-400">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Products" value={summary.totalProducts} icon={Package} />
            <StatCard label="Total Categories" value={summary.totalCategories} icon={Layers} />
            <StatCard label="Total Stock Qty" value={summary.totalStockQuantity} icon={Package} />
            <StatCard label="Low Stock" value={summary.lowStockProducts} icon={AlertTriangle} tone="amber" />
            <StatCard label="Out of Stock" value={summary.outOfStockProducts} icon={XCircle} tone="red" />
            <StatCard label="Today's Sales" value={`GH₵ ${Number(summary.todaySales).toFixed(2)}`} icon={DollarSign} tone="green" />
            <StatCard label="Monthly Sales" value={`GH₵ ${Number(summary.monthSales).toFixed(2)}`} icon={TrendingUp} tone="green" />
            <StatCard label="Est. Monthly Profit" value={`GH₵ ${Number(summary.profit).toFixed(2)}`} icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card lg:col-span-2">
              <h2 className="font-semibold mb-3">Sales — Last 14 Days</h2>
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>

            <div className="card">
              <h2 className="font-semibold mb-3">Top Selling Products</h2>
              <ul className="space-y-2">
                {summary.topSellingProducts.map((t) => (
                  <li key={t.productId} className="flex justify-between text-sm">
                    <span>{t.Product?.name || "Unknown"}</span>
                    <span className="text-gray-400">{t.dataValues?.totalSold || t.totalSold} sold</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card mt-6">
            <h2 className="font-semibold mb-3">Recent Transactions</h2>
            <table className="data-table w-full">
              <thead>
                <tr><th>Invoice</th><th>Items</th><th>Total</th><th>Date</th></tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.invoiceNumber}</td>
                    <td>{t.SaleItems?.length || 0}</td>
                    <td>GH₵ {Number(t.total).toFixed(2)}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ProtectedRoute>
  );
}
