'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Package,
  ShieldCheck,
  Store,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface OperationalRole {
  role: string;
  label: string;
  email: string;
  name: string;
  scope: string;
  icon: React.ReactNode;
  badgeColor: string;
}

const ENTERPRISE_ROLES: OperationalRole[] = [
  {
    role: 'DRIVER',
    label: 'Delivery Driver',
    email: 'driver.kasun@waypoint.lk',
    name: 'Kasun Bandara',
    scope: 'Route WF-1043 (VEH057 Reefer)',
    icon: <Truck className="w-5 h-5 text-blue-400" />,
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    role: 'LOADER',
    label: 'Warehouse Loader',
    email: 'loader.kiosk@waypoint.lk',
    name: 'Sunil Perera',
    scope: 'Peliyagoda Bay 04 Kiosk',
    icon: <Package className="w-5 h-5 text-amber-400" />,
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  {
    role: 'DISPATCHER',
    label: 'Central Dispatcher',
    email: 'dispatcher@waypoint.lk',
    name: 'Nimali Perera',
    scope: 'Kandy & Peliyagoda Fleet Hub',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  {
    role: 'STORE_MANAGER',
    label: 'Store Manager',
    email: 'manager.out077@waypoint.lk',
    name: 'Aravinda Silva',
    scope: 'OUT077 (Kandy Fresh Outlet)',
    icon: <Store className="w-5 h-5 text-purple-400" />,
    badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('manager.out077@waypoint.lk');
  const [password, setPassword] = useState('waypoint2026');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      // Store in localStorage for easy client-side API requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('waypoint_token', data.token);
        localStorage.setItem('waypoint_user', JSON.stringify(data.user));
      }

      router.push(data.redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate');
      setIsLoading(false);
    }
  };

  const selectRole = (account: OperationalRole) => {
    setEmail(account.email);
    setPassword('waypoint2026');
    handleLogin(account.email, 'waypoint2026');
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-[#070D18] via-[#0B1528] to-[#08101E]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-8">
        {/* Header with Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wide">
            <Calendar className="w-3.5 h-3.5" />
            <span>Operational Cycle: September 28, 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
              WAYPOINT
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
            Intelligent Logistics & Distribution Platform. Role-based orchestration from dispatch to doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Operational Role Quick-Access Portals */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Operational Role Portals
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Single Sign-On (SSO)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENTERPRISE_ROLES.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectRole(acc)}
                  disabled={isLoading}
                  className="glass-panel glass-panel-hover text-left p-4 rounded-xl border border-slate-800 bg-[#111C32]/80 hover:bg-[#162440] transition-all group flex flex-col justify-between h-36 relative overflow-hidden cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
                      {acc.icon}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                      {acc.label}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-100 group-hover:text-white flex items-center justify-between">
                      {acc.name}
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{acc.scope}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Login Form */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 bg-[#0E182A]/90 shadow-2xl relative">
            <h2 className="text-lg font-bold text-white mb-1">Standard Sign In</h2>
            <p className="text-xs text-slate-400 mb-6">Enter system credentials to access your dashboard</p>

            {error && (
              <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@waypoint.lk"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Waypoint Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
