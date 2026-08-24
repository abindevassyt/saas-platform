'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Mail, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/tenants/members');
      setMembers(res.data);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiClient.request('/tenants/members/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setInviteEmail('');
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await apiClient.request(`/tenants/members/${userId}`, { method: 'DELETE' });
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Team Management</h1>
        <p className="text-xs text-slate-400 mt-1">Manage organization members, RBAC roles, and invitation links</p>
      </div>

      {/* Invite Member Form */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-cyan-400" />
          <span>Invite New Member</span>
        </h2>

        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Input
              label="Member Email Address"
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>
          <Button type="submit" disabled={inviting}>
            {inviting ? 'Inviting...' : 'Send Invitation'}
          </Button>
        </form>
      </Card>

      {/* Members List */}
      <Card className="space-y-4">
        <h2 className="text-base font-bold text-slate-200">Organization Members</h2>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading members...</div>
        ) : (
          <div className="divide-y divide-slate-850">
            {members.map((member) => (
              <div key={member.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 border border-slate-700">
                    {member.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{member.user.name}</p>
                    <p className="text-xs text-slate-400 flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{member.user.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge variant={member.role === 'OWNER' ? 'amber' : member.role === 'ADMIN' ? 'cyan' : 'slate'}>
                    {member.role}
                  </Badge>
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemove(member.user.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
