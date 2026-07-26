export default function StatCard({ label, value, sub, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-700/20",
    red: "bg-red-50 text-red-600 dark:bg-red-700/20",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-700/20",
    green: "bg-green-50 text-green-600 dark:bg-green-700/20",
  };
  return (
    <div className="card flex items-center gap-4">
      {Icon && <div className={`p-3 rounded-xl ${tones[tone]}`}><Icon size={20} /></div>}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  );
}
