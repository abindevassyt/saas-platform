'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, FolderKanban, ShieldCheck } from 'lucide-react';
import { TenantSwitcher } from './TenantSwitcher';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Team Members', href: '/team', icon: Users },
    { label: 'Organization Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between p-4 h-screen sticky top-0">
      <div className="space-y-6">
        <div className="flex items-center space-x-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <FolderKanban className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Nexus SaaS
          </span>
        </div>

        <TenantSwitcher />

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Trust Enterprise</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          RBAC Tenant Isolation & Encrypted Session Token Rotation active.
        </p>
      </div>
    </aside>
  );
};
