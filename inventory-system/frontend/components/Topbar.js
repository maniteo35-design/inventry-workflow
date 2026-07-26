"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Moon, Sun, LogOut, Search } from "lucide-react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);

  function toggleDark() {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 text-sm text-gray-400 w-80">
        <Search size={16} />
        <input placeholder="Search anything…" className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200" />
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="text-sm text-right">
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-gray-400 capitalize">{user?.role?.replace("_", " ")}</div>
        </div>
        <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
