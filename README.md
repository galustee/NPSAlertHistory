# NPS Alerts History

**Track the complete timeline of U.S. National Park alerts.**

The National Park Service provides only current alerts. This project polls the NPS API once daily and stores the full alert history, letting you see how alerts have changed over time for each park.

## ✨ Features

- 🔄 **Real-time Polling** - Fetches from NPS API once per day at 9 AM UTC via Vercel Cron
- 📊 **Complete History** - Append-only design tracks every alert change
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 🔒 **Secure** - Database credentials never exposed to frontend
- 💰 **Cheap** - ~$5-10/month (Vercel + Supabase)
- ⚡ **Scalable** - Serverless architecture handles growth efficiently
- 🔍 **Searchable** - Find parks by name or code

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- NPS API key (free)
- Vercel account (free tier works)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** (`.env.local`)
   ```env
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_KEY=your_key
   NPS_API_KEY=your_api_key
   CRON_SECRET=your_secret
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 📋 Setup Guide

See **[SETUP.md](./SETUP.md)** for detailed environment setup, API documentation, and deployment instructions.

## 🏗️ Architecture

```
Vercel (Next.js + API Routes + Cron)
    ↕️
Supabase (PostgreSQL Database)
    ↕️
NPS Developer API
```

**Key Design:**
- Append-only history (never updates/deletes alerts)
- Unique constraint on `(park_id, nps_alert_id, last_updated_by_nps)` ensures idempotency
- Service role key used only server-side
- Public API routes mediate browser access

## 📁 Project Structure

```
app/
├── api/
│   ├── poll/route.ts              # Cron endpoint
│   └── parks/
│       ├── route.ts               # List all parks
│       └── [code]/
│           ├── alerts/route.ts    # Current alerts
│           └── history/route.ts   # Alert timeline
├── parks/[code]/page.tsx          # Park detail page
├── page.tsx                       # Home page
└── layout.tsx

lib/
└── supabase.ts                    # Supabase client (server-side)
```

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/parks` | GET | List all parks |
| `/api/parks/[code]/alerts` | GET | Current alerts for a park |
| `/api/parks/[code]/history?alertId=...` | GET | Alert timeline |
| `/api/poll` | GET | Cron job (secure) |

See **[SETUP.md](./SETUP.md)** for detailed examples.

## 🚢 Deployment

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy (cron jobs automatically configured)

## 💰 Cost Estimate

| Service | Cost |
|---------|------|
| Vercel | $0 (free tier) |
| Supabase | ~$5-10 |
| NPS API | Free |
| **Total** | **~$5-10/month** |

## 🐛 Troubleshooting

**Cron not running?** Check Vercel dashboard → Settings → Cron Jobs

**No data in database?** Verify API keys are set and valid

**Build errors?** Run `npm run build` locally and check TypeScript errors

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NPS Developer API](https://developer.nps.gov)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
