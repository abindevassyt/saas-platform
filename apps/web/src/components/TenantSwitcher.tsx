'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Building2, ChevronDown, Check } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export const TenantSwitcher: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadTenants() {
      try {
        const res: { data: Tenant[] } = await apiClient.request('/tenants/user-tenants');
        setTenants(res.data);

        const savedId = apiClient.getTenantId();
        const current = res.data.find((t) => t.id === savedId) || res.data[0];

        if (current) {
          setActiveTenant(current);
          apiClient.setTenantId(current.id);
        }
      } catch (err) {
        console.error('Failed to load tenants:', err);
      }
    }
    loadTenants();
  }, []);

  const handleSelect = (tenant: Tenant) => {
    setActiveTenant(tenant);
    apiClient.setTenantId(tenant.id);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-left truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{activeTenant?.name || 'Select Tenant'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{activeTenant?.role.toLowerCase() || 'Org'}</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="p-2 space-y-1">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleSelect(tenant)}
                className={`w-full flex items-center justify-between p-2 rounded-md text-xs transition ${
                  tenant.id === activeTenant?.id ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{tenant.name}</span>
                {tenant.id === activeTenant?.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
