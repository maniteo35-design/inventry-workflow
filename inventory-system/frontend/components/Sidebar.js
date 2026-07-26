"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/pos", label: "Point of Sale", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/purchases", label: "Purchases", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
      <div className="h-16 flex items-center px-5 font-bold text-lg text-brand-600">
        Inven<span className="text-gray-800 dark:text-gray-100">Track</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-500"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
