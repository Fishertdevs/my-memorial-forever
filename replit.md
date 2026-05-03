# Workspace

## Overview

"En Tu Memoria" — a Spanish memorial website. Monorepo with React+Vite frontend and Express/PostgreSQL API.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Wouter + TanStack Query + Tailwind CSS v4 + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/memorial` — main memorial frontend (preview path `/`)
- `artifacts/api-server` — Express API (path `/api`)

## Brand

- **Orange**: `#f97316`
- **Black**: `#0d0d0d`
- **White**: `#f7f7f7`
- **Fonts**: Playfair Display (serif), Lato (sans)

## Pages

- `/` (Home) — Hero split-screen, velitas carousel, CTA, footer
- `/personas` — Memorial grid with person cards
- `/personas/:id` — PersonaDetail with tabs (Recuerdos / Velitas)
- `/velas` — Multi-step velita wizard (4 steps)
- `/recuerdos` — Pinterest-style gallery with carousel modal

## UI Conventions

- All dates use `formatDateEs()` helper (Spanish locale)
- `formatDateEs(raw)` defined locally in each page file
- Footer: white bg, `3px solid #f97316` top border — present on all pages
- Navbar: plain links + orange CTA button for "Encender Velita"
- Hero: split-screen (55% white left / 45% dark right), staggered entrance animations
- Hero card: decorative orange corner brackets, `hero-enter-N` animation classes
- CTA links in orange: text + SVG arrow, no background fill
- Tab badges: count shown as small pill next to tab label

## CSS Animations (index.css)

- `candle-flame`, `candle-body` — candle flicker/glow
- `fade-in-up` — general entry
- `step-appear` — wizard step transition
- `hero-enter-1` through `hero-enter-6` — staggered hero text entrance

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
