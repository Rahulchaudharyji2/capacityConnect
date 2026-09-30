# Capacity Connect - Operational Baseline & Deployment Guide

This document outlines the required configuration and architecture for taking the Capacity Connect prototype from a local development environment into a staging or production-like topology (Stage 6 Operational Readiness).

## 1. Environment Variable Configuration

Capacity Connect requires strict cryptographic controls to maintain RBAC boundaries. The prototype fallback mechanism has been deliberately removed.

You **must** configure the following variables in a `.env` file at the repository root:

```env
# Required: Must be a cryptographically secure random string (minimum 32 characters)
# Example generation: openssl rand -base64 32
JWT_SECRET="your-secure-32-byte-secret-here"

# Required: Database connection string
DATABASE_URL="file:./dev.db"
```

If `JWT_SECRET` is missing or shorter than 32 characters, the application will forcefully crash during authentication attempts.

## 2. PostgreSQL Migration Strategy

The prototype relies on SQLite (`file:./dev.db`) for rapid iteration. For production deployments:

1. Update the `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`.
2. Change the `DATABASE_URL` environment variable to a valid PostgreSQL connection string (e.g. `postgresql://user:password@host:5432/capacity_connect`).
3. Run `npx prisma db push` (or `npx prisma migrate dev` after clearing old migration histories) to seed the new Postgres cluster.

## 3. Storage Volume Requirements

The prototype utilizes a local storage adapter (`src/lib/storage.ts`) that writes binary assets (PDFs) to the `.storage/` directory at the project root.
- **Data Persistence**: In a containerized environment (e.g. Docker, Kubernetes), this directory **must** be mounted to a persistent volume (PersistentVolumeClaim). If the container crashes or restarts, any PDFs stored ephemerally will be destroyed, corrupting the database references.
- **Public Access**: The `.storage/` directory is deliberately located outside the Next.js `public/` directory. Direct HTTP access to these files is physically impossible by design; they can only be read via the authorized `/api/resources/[id]` endpoint.

## 4. End-to-End Workflows (Acceptance Baseline)

The following pipelines have been verified and locked:
- **Authentication**: JWT-signed cookie validation explicitly drops unauthorized or tampered access requests across all pages and API routes.
- **Trainer Indexing UI**: Trainers can upload PDFs, view parsing status (`PENDING`, `SUCCESS`, `FAILED`), and securely trigger server-side re-extraction via the `retryIndexing` action. 
- **Admin Audit Ledgers**: Every structural change (enrollments, uploads, deletions, retries) is written to `AuditLog`. Admins can dynamically filter these logs.
- **Learner Search**: Knowledge Library queries are securely scoped to `Course.enrollments` utilizing server-side Prisma validation before `pdf-parse` excerpts are generated.

## 5. Outstanding Technical Gaps (Future Roadmap)

- **AI/RAG Integration**: The infrastructure is now stable enough for Stage 7 (LLM embedding queries) since the base extraction engine is secured.
- **Session Revocation**: JWT sessions currently live for a stateless 8 hours. Active session invalidation (kicking users) requires an additional stateful `Session` table.
- **S3 Object Storage**: Moving off `.storage/` to an AWS S3 or GCP Cloud Storage adapter.
