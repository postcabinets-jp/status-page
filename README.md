# StatusPage OSS

Open-source alternative to Instatus. Free, self-hosted status pages with incident management, uptime tracking, and email subscriptions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/status-page&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20project%20credentials&project-name=status-page&repository-name=status-page)

## Features

- **Unlimited components** — No artificial limits on monitored services
- **Incident lifecycle** — Investigating → Identified → Monitoring → Resolved with timestamped updates
- **Maintenance windows** — Schedule planned downtime in advance (Instatus charges $49/mo for this)
- **90-day uptime bars** — Per-component uptime history visualization
- **Email subscriptions** — Users subscribe for incident/maintenance notifications
- **Public status page** — Clean, shareable `/s/[slug]` URL
- **Incident history** — Full timeline of past resolved incidents
- **Row Level Security** — Supabase RLS ensures users can only access their own data

## Tech Stack

- **Next.js 15** (App Router, TypeScript strict)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS v4 + shadcn/ui**
- **Vercel** deployment

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/postcabinets-jp/status-page
cd status-page
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/20260627000001_initial_schema.sql` via Supabase SQL Editor
3. Copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

Click the deploy button above or:

```bash
vercel --prod
```

Set these environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

## Database Schema

All tables use RLS with public read access and owner-only write access. See `supabase/migrations/` for the full schema.

| Table | Purpose |
|---|---|
| `pages` | Status pages (one per service) |
| `components` | Services being monitored |
| `incidents` | Active and historical incidents |
| `incident_updates` | Timestamped status updates |
| `incident_components` | Affected components per incident |
| `maintenances` | Scheduled maintenance windows |
| `subscribers` | Email notification subscribers |
| `uptime_records` | Daily uptime history per component |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, forgot-password
│   ├── (dashboard)/     # Admin dashboard (protected)
│   │   └── dashboard/
│   │       └── [pageId]/
│   │           ├── incidents/
│   │           ├── maintenance/
│   │           └── settings/
│   ├── s/[slug]/        # Public status pages
│   │   └── history/     # Incident history
│   └── actions/         # Server Actions
├── components/
│   ├── auth/
│   ├── dashboard/
│   └── status/
├── lib/
│   ├── supabase/        # Client, server, middleware
│   └── status.ts        # Status config & utilities
└── types/
    └── database.ts      # Supabase type definitions
```

## vs. Instatus

| Feature | StatusPage OSS | Instatus Starter |
|---|---|---|
| Price | Free | $15/mo |
| Components | Unlimited | 25 max |
| Incident management | Yes | Yes |
| Maintenance windows | Yes | Business plan ($49/mo) |
| Email subscriptions | Yes | Limited |
| 90-day uptime history | Yes | Yes |
| Data ownership | Full (your Supabase DB) | Instatus servers |
| Open-source | MIT | No |

## License

MIT

---

Built by [POST CABINETS](https://postcabinets.co.jp) — Web & SNS Marketing, Tokyo
