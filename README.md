# ServiceHub Backend (TypeScript)

Scalable Node.js + Express backend scaffold with MongoDB, Cloudinary config, and phase-1 auth module.

## Stack

- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- JWT auth
- Cloudinary config ready

## Quick Start

1. Install deps:
   - `npm install`
2. Create env file:
   - copy `.env.example` to `.env`
3. Run dev server:
   - `npm run dev`

Server base URL defaults to `http://localhost:5000`.

## Scripts

- `npm run dev` - start in watch mode with `tsx`
- `npm run build` - compile TypeScript to `dist`
- `npm start` - run compiled server

## API (Phase 1: Auth)

Base prefix: `/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

## Suggested Next Modules

- Provider profile & service management
- Booking workflow
- Payments
- Reviews
- File upload endpoints (Cloudinary usage)
