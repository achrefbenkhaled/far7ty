# Invly — Premium Invitation Platform

Invly is a production-oriented invitation SaaS platform with a polished landing experience, an invitation builder shell, and a secure API foundation. The project is structured as a Vite + React frontend and a TypeScript Express backend, designed to scale into a multi-tenant product.

## Architecture Overview

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma (prepared for future migration)
- Auth: JWT + refresh tokens + role-based access skeleton
- Storage: Cloudinary + Sharp (prepared for future integration)
- Deployment: Vercel + Railway/Render + Neon + GitHub Actions

## Monorepo Structure

- client/: Vite application
- server/: Express API
- prisma/: Prisma schema and migrations
- shared/: DTOs and contract helpers
- docs/: architecture and deployment docs

## Quick Start

1. Install dependencies in the workspace root.
2. Start the client and server.
3. Visit http://localhost:5173 and http://localhost:4000/health.

## Roadmap

- Authentication system
- Prisma schema and database migrations
- Invitation builder and guest management
- Payments and subscription architecture
- Admin panel and analytics

# far7ty
