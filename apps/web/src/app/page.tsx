import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Layers, Lock, Cpu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950">
            N
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Nexus SaaS
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get Started Free <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] rounded-full -z-10 transform -translate-y-1/2"></div>
        <Badge variant="cyan">PRODUCTION-READY MULTI-TENANT SAAS ARCHITECTURE</Badge>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-100">
          Scale Enterprise SaaS with <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Zero-Trust Isolation & Real-Time Speed
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Built on Node.js Clean Layered Architecture, Next.js 14 Server Components, PostgreSQL Prisma ORM, Redis Token Bucket Rate Limiting, and Socket.io WebSockets.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="shadow-lg shadow-cyan-500/25">
              Launch Free Tenant Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Explore Live Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Enterprise Engine Capabilities</h2>
          <p className="text-sm text-slate-400">Strict SDLC, Docker containerized, Prometheus metrics, and Terraform IaC.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Multi-Tenant RBAC Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Logical database partitioning via tenant_id foreign keys, JWT HttpOnly tokens with Redis refresh token rotation, and role permission matrices (OWNER, ADMIN, MEMBER).
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Redis Rate Limiter & WebSockets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Token Bucket rate limiting algorithm, real-time bi-directional WebSockets backed by Redis Pub/Sub adapter for distributed horizontal scaling.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Observability & Prometheus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OpenTelemetry correlation IDs (x-request-id), RFC 7807 problem details error format, Grafana dashboards, and auto-generated Swagger API specs.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Transparent Pricing Plans</h2>
          <p className="text-sm text-slate-400">Integrated with Stripe webhook handlers and billing status tracking.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="space-y-6 border-slate-800">
            <div>
              <Badge variant="slate">STARTER</Badge>
              <h3 className="text-2xl font-bold mt-2">$29 <span className="text-xs text-slate-400 font-normal">/ month</span></h3>
              <p className="text-xs text-slate-400 mt-1">Ideal for growing teams and startups.</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2"><CheckIcon /> <span>Up to 10 Team Members</span></li>
              <li className="flex items-center space-x-2"><CheckIcon /> <span>50 Tenant Projects</span></li>
              <li className="flex items-center space-x-2"><CheckIcon /> <span>Standard Redis Rate Limiting</span></li>
            </ul>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full">Choose Starter</Button>
            </Link>
          </Card>

          <Card className="space-y-6 border-cyan-500/40 relative">
            <div className="absolute -top-3 right-6">
              <Badge variant="cyan">MOST POPULAR</Badge>
            </div>
            <div>
              <Badge variant="cyan">ENTERPRISE PRO</Badge>
              <h3 className="text-2xl font-bold mt-2">$99 <span className="text-xs text-slate-400 font-normal">/ month</span></h3>
              <p className="text-xs text-slate-400 mt-1">Full power for high-volume enterprise organizations.</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2"><CheckIcon /> <span>Unlimited Team Members</span></li>
              <li className="flex items-center space-x-2"><CheckIcon /> <span>Unlimited Tenant Projects & Tasks</span></li>
              <li className="flex items-center space-x-2"><CheckIcon /> <span>Dedicated WebSocket Redis Adapter</span></li>
              <li className="flex items-center space-x-2"><CheckIcon /> <span>Priority Prometheus Metrics & SLA</span></li>
            </ul>
            <Link href="/register" className="block">
              <Button variant="primary" className="w-full">Get Enterprise Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      <footer className="mt-auto border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        © 2026 Nexus SaaS Platform Architecture. Production-Grade Enterprise Blueprint.
      </footer>
    </div>
  );
}

function CheckIcon() {
  return <span className="text-cyan-400 font-bold">✓</span>;
}
