# 🚀 Nexus Multi-Tenant SaaS Platform Architecture

[![CI/CD Pipeline](https://github.com/saas-platform/workflows/ci.yml/badge.svg)](https://github.com/saas-platform/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-v14+-blue.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-blue.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-v7-red.svg)](https://redis.io)

An end-to-end, production-grade, highly available, multi-tenant SaaS application built from scratch adhering to Clean Layered Architecture, zero-trust security practices, Docker multi-stage containerization, GitHub Actions CI/CD pipelines, and Terraform infrastructure definition.

---

## 📑 Architecture Overview

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|   Next.js 14 App Router (React Server Components + TanStack Query + Tailwind) |
+---------------------------------------+---------------------------------------+
                                        |
                                        v HTTP / WebSocket (WSS)
+---------------------------------------+---------------------------------------+
|                             EDGE & SECURITY LAYER                             |
|          Caddy Edge Reverse Proxy (TLS Termination, Rate Limiting)            |
+---------------------------------------+---------------------------------------+
                                        |
                                        v Forwarded Headers & Clean Requests
+---------------------------------------+---------------------------------------+
|                              API GATEWAY & CORE API                           |
|       Express / Node.js Backend API (Clean Layered Architecture)               |
|  - Auth & RBAC Middleware        - Tenant Scoping & Resolution               |
|  - Token Bucket Rate Limiter     - RFC 7807 Global Error Handler              |
|  - Prometheus Metrics Exporter   - Socket.io Real-Time Server                 |
+------+--------------------------------+--------------------------------+------+
       |                                |                                |
       v SQL (PgBouncer Pool)           v Pub/Sub & Distributed Cache    v Logs / Telemetry
+------+------------------+   +---------+------------------+   +---------+------------------+
| DATABASE LAYER          |   | CACHING & REALTIME ENGINE|   | OBSERVABILITY           |
| PostgreSQL (Multi-tenant|   | Redis Cluster / Standalone|   | Prometheus + Grafana     |
| isolated via tenant_id  |   |  - Session / Refresh Tokens|   | Winston Structured JSON  |
| indexed foreign keys)   |   |  - Rate Limit Counters    |   | OpenTelemetry Traces     |
| Managed via Prisma ORM  |   |  - WS Pub/Sub Adapter     |   |                          |
+-------------------------+   +----------------------------+   +--------------------------+
```

---

## 🛠️ Tech Stack & Key Components

- **Backend API Core (`apps/api`):** Node.js 20, TypeScript, Express, Winston structured JSON logger, Zod validator, RFC 7807 Problem Details error handler.
- **Frontend Client (`apps/web`):** Next.js 14 (App Router, Server Components), Tailwind CSS, Lucide icons, TanStack React Query client caching.
- **Database Layer (`packages/database`):** PostgreSQL managed via Prisma ORM with connection pooling (PgBouncer compatible), composite indexes on `(tenant_id, created_at)`, timestamp triggers, and soft-delete support.
- **Caching & Real-time Engine:** Redis (Token Bucket rate limiter, JWT refresh token rotation, Socket.io Redis adapter for distributed multi-instance WebSockets).
- **Containerization (`docker/`):** Production multi-stage Dockerfiles (`Dockerfile.api`, `Dockerfile.web`), non-root `USER node` security, Caddy edge reverse proxy, `docker-compose.yml`.
- **CI/CD (`.github/workflows/`):** Automated linting, type checks, Prisma validation, integration tests with ephemeral Postgres/Redis service containers, Trivy security vulnerability scanner, multi-arch Docker image push to GHCR.
- **Infrastructure as Code (`terraform/`):** AWS VPC, ECS Fargate cluster, RDS PostgreSQL database, ElastiCache Redis cluster, ALB setup.

---

## 🚀 Quickstart & Local Setup

### 1. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Run Entire Platform via Docker Compose
Build and launch Postgres, Redis, API Server, Next.js Web Client, and Caddy Edge Proxy with a single command:

```bash
docker-compose -f docker/docker-compose.yml up --build -d
```

Access services at:
- **Web Client & Gateway:** `http://localhost`
- **Direct API Server:** `http://localhost:4000`
- **Health Check Endpoint:** `http://localhost/health`
- **Prometheus Metrics:** `http://localhost/metrics`

### 3. Local Monorepo Development (without Docker)
Install dependencies and run database migrations & seeding:
```bash
npm install
npm run db:generate
npm run db:seed
npm run dev
```

---

## 🔑 Environment Variables Dictionary

| Key | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | `4000` | Backend API port |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection pool URL |
| `REDIS_URL` | `redis://...` | Redis connection URL |
| `JWT_ACCESS_SECRET` | `super_secret...` | 32+ character JWT access token secret |
| `JWT_REFRESH_SECRET` | `super_secret...` | 32+ character JWT refresh token secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |

---

## 🧪 Testing & Verification Commands

```bash
# Type check all packages
npm run type-check

# Run unit & integration tests
npm run test

# Validate Prisma Database Schema
npx prisma validate --schema=packages/database/prisma/schema.prisma
```

---

## 📄 License & Standards

Built in compliance with strict Zero-Trust Enterprise Architectural Standards.
