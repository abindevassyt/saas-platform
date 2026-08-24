# Multi-Tenant SaaS Platform Architecture Blueprint

## System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|   Next.js 14 Web Application (React Server Components + TanStack Query)       |
+---------------------------------------+---------------------------------------+
                                        |
                                        v HTTP / WebSocket (WSS)
+---------------------------------------+---------------------------------------+
|                             EDGE & SECURITY LAYER                             |
|          Caddy / Nginx Reverse Proxy (TLS Termination, Rate Limiting)         |
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

## Core Design Principles

1. **Multi-Tenancy Model:**
   - Discriminator-based logical isolation (`tenant_id` foreign key on all tenant resources).
   - Foreign key indexes and composite indexes on `(tenant_id, id)` and `(tenant_id, created_at)` ensure query performance and zero tenant data leak.

2. **Clean Layered Architecture:**
   - **Controller Layer:** Parses input (Zod validation), handles HTTP status codes, formats RFC 7807 error structures.
   - **Service Layer:** Contains core enterprise domain logic, permissions, transactional business workflows.
   - **Repository Layer:** Abstracted database access using Prisma Client enforcing `tenant_id` context.

3. **Zero-Trust Security & Auth:**
   - Short-lived Access JWTs (15 mins) transmitted in HttpOnly, SameSite, Secure cookies.
   - Refresh Token rotation stored in Redis with revocation capability.
   - Fine-grained RBAC permissions: `OWNER`, `ADMIN`, `MEMBER`.

4. **Scalable Real-time Messaging:**
   - Socket.io instance backed by Redis Pub/Sub adapter allowing multi-container horizontally scaled backend execution.

5. **Resilience & Rate Limiting:**
   - Redis-backed Token Bucket algorithm per Tenant IP / User ID.
   - Structured JSON logging with `x-request-id` correlation.
