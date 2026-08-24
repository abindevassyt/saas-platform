'use client';

import React from 'react';
import { CreditCard, Building, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Organization Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure tenant metadata, Stripe billing plans, and API keys</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Organization Metadata */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>General Profile</span>
            </h2>

            <div className="space-y-4">
              <Input label="Tenant Display Name" defaultValue="Acme Corporation" />
              <Input label="Tenant Slug (Domain Identifier)" defaultValue="acme-corp" disabled />
              <Input label="Support Contact Email" defaultValue="support@acme.com" />
              <Button>Save Settings</Button>
            </div>
          </Card>

          <Card className="space-y-4 border-rose-500/20">
            <h2 className="text-base font-bold text-rose-400">Danger Zone</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Soft-delete or permanently purge tenant organization data. All associated projects, tasks, and memberships will be soft-deleted with cascade rules.
            </p>
            <Button variant="danger" size="sm">
              Delete Organization
            </Button>
          </Card>
        </div>

        {/* Subscription & Billing Status Sidebar */}
        <div className="space-y-6">
          <Card className="space-y-4 border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">CURRENT PLAN</span>
              <Badge variant="cyan">ACTIVE</Badge>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-100">Enterprise Pro</h3>
              <p className="text-xs text-slate-400 mt-0.5">$99 / month • Renews Sept 2026</p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Stripe Customer ID</span>
                <span className="font-mono text-[11px] text-slate-400">cus_demo12345</span>
              </div>
              <div className="flex justify-between">
                <span>PgBouncer Connections</span>
                <span className="font-mono text-[11px] text-slate-400">Pooled (Max 100)</span>
              </div>
            </div>

            <Button variant="outline" className="w-full text-xs">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Manage Stripe Subscription
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
