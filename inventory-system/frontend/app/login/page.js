"use client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-brand-600">InvenTrack</h1>
          <p className="text-xs text-gray-400">Sign in to your account</p>
        </div>
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Password</label>
          <input className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Signing in…" : "Sign In"}</button>
        <p className="text-xs text-gray-400 text-center">Seeded demo login: admin@example.com / Password123!</p>
      </form>
    </div>
  );
}
