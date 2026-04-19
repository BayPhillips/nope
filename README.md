# Sourdough Manager

A full-stack web app for managing sourdough recipes, guided bake sessions, and bake history.

**Stack:** Next.js 16, Prisma 7, PostgreSQL, Tailwind CSS

## Features

- **Recipe Manager** — Create recipes with live baker's math (percentages auto-calculate from weights). Supports multi-flour blends, drag-to-reorder steps, and step templates.
- **Bake Planner & Timeline** — Start a bake session from any recipe. Guided step-by-step view with per-step countdown/countup timers. Timer state persists across page reloads.
- **Bake History & Logs** — Browse completed bakes with star ratings, outcome notes, and improvement notes.

## Setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Or if you have PostgreSQL locally:

```bash
sudo -u postgres psql -c "CREATE USER sourdough WITH PASSWORD 'sourdough';"
sudo -u postgres psql -c "CREATE DATABASE sourdough OWNER sourdough;"
sudo -u postgres psql -c "ALTER USER sourdough CREATEDB;"
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local if your database credentials differ from the defaults
```

### 3. Install dependencies

```bash
npm install
# postinstall runs `prisma generate` automatically
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply migrations (reads `.env.local`) |
| `npm run db:migrate:dev` | Create + apply new migration (dev only) |

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # React components
    ui/          # Base UI components (Button, Card, Input, etc.)
    layout/      # Navbar
    recipes/     # Recipe form, ingredients table, step list
    bakes/       # Timeline, step cards, timers, log form
    shared/      # StarRating, ConfirmDialog
  lib/           # Utilities: prisma.ts, bakersMath.ts, timeUtils.ts
  types/         # Shared TypeScript types
prisma/
  schema.prisma  # Database schema
  migrations/    # SQL migration history
```
