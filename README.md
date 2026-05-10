# ServiceHub Backend

> **Note to Reviewer:**
> Sir, I was only able to work on this project for about 4-5 hours because I joined the course very recently on May 6th. As a result, I am running 4 months late on the project timeline. Due to the time constraints, I have only been able to complete the basic authentication on the backend and some core UI on the frontend. I am submitting what I could manage to build within this timeframe. Thank you for understanding.

## Overview
Scalable Node.js + Express backend scaffold with MongoDB, Cloudinary config, and phase-1 auth module.

## Stack
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- JWT auth

## Quick Start
1. Install deps: `npm install`
2. Create env file: copy `.env.example` to `.env`
3. Run dev server: `npm run dev`

Server base URL defaults to `http://localhost:5000`.

## API (Phase 1: Auth)
Base prefix: `/api/v1`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)
