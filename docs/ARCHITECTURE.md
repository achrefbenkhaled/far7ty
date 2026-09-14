# Architecture Overview

## System Context

Invly is organized as a public invitation platform with a React frontend and a small Express API for invitation data.

## Core Modules

- Public browsing and template gallery
- Invitation builder shell and guest management APIs
- Analytics and reporting foundations
- Payment and subscription stubs for Stripe/PayPal/Flouci/Konnect integrations

## Deployment Strategy

- Frontend: Vercel
- Backend: Railway or Render
- Database: Neon PostgreSQL
- Storage: Cloudinary + Sharp
- CI/CD: GitHub Actions
- Containerization: Docker + Compose
