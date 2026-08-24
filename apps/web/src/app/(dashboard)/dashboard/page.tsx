'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FolderKanban, CheckCircle2, Clock, AlertCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RealtimeFeed } from '@/components/RealtimeFeed';
import { apiClient } from '@/lib/api-client';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  _count?: { tasks: number };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New Project Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        search: searchTerm,
      });
      const res: any = await apiClient.request(`/resources/projects?${query.toString()}`);
      setProjects(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, searchTerm]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiClient.request('/resources/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName, description: projectDesc }),
      });
      setProjectName('');
      setProjectDesc('');
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Organization Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Tenant Resource Metrics, Active Projects & Real-time Feeds</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4 mr-1.5" /> Create Project
        </Button>
      </div>

      {/* Resource Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{projects.length}</p>
          <p className="text-[10px] text-emerald-400">Tenant Isolated</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">142</p>
          <p className="text-[10px] text-emerald-400">+12% from last week</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">API Rate Limits</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">200 req / min</p>
          <p className="text-[10px] text-slate-400">Token Bucket Redis</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Security Health</span>
            <AlertCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">100% Secure</p>
          <p className="text-[10px] text-slate-400">RBAC Verified</p>
        </Card>
      </div>

      {/* Main Grid: Projects Table & Real-Time Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Data Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-200">Organization Projects</h2>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">Loading tenant projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No projects found. Create one above!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-3 px-3">PROJECT NAME</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-3">TASKS</th>
                      <th className="py-3 px-3">CREATED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-slate-200">{proj.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{proj.description || 'No description'}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="cyan">{proj.status}</Badge>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300 font-mono">
                          {proj._count?.tasks || 0} tasks
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
              <span className="text-slate-400">Page {page} of {totalPages}</span>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time Activity Feed Column (1 Col) */}
        <div className="space-y-6">
          <RealtimeFeed />
        </div>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Create New Tenant Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="e.g. Migration to AWS ECS"
              />
              <Input
                label="Description"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Brief project details..."
              />
              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
