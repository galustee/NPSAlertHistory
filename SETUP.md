# NPS Alerts History - Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# NPS API
NPS_API_KEY=your_nps_api_key

# Vercel Cron Security
CRON_SECRET=your_secret_token
```

### Getting Each Variable

**SUPABASE_URL & SUPABASE_SERVICE_KEY:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy `Project URL` and `Service Role Key` (keep service key secret!)

**NPS_API_KEY:**
1. Visit https://developer.nps.gov/
2. Sign up for an API key
3. Takes ~30 seconds, instant approval

**CRON_SECRET:**
1. Generate a random string: `openssl rand -hex 32` (or use any secure random value)
2. In Vercel dashboard: Settings → Environment Variables
3. Add `CRON_SECRET` with your random string
4. Also add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `NPS_API_KEY`

---

## Database Schema

Already created in your Supabase project:

```sql
create table parks (
  id uuid primary key default gen_random_uuid(),
  park_code text unique not null,
  name text not null,
  created_at timestamptz default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  park_id uuid references parks(id) on delete cascade,
  nps_alert_id text not null,
  title text,
  description text,
  category text,
  url text,
  last_updated_by_nps timestamptz,
  fetched_at timestamptz default now(),
  unique (park_id, nps_alert_id, last_updated_by_nps)
);

create index on alerts (park_id);
create index on alerts (fetched_at desc);
```

---

## Project Structure

```
app/
├── api/
│   ├── poll/route.ts              # Cron job - fetches from NPS API
│   └── parks/
│       ├── route.ts               # GET /api/parks - all parks
│       └── [code]/
│           ├── alerts/route.ts    # GET /api/parks/[code]/alerts
│           └── history/route.ts   # GET /api/parks/[code]/history?alertId=...
├── parks/
│   └── [code]/page.tsx            # Park detail page
├── layout.tsx
├── page.tsx                       # Home page
└── globals.css
```

---

## API Endpoints

### `/api/parks` - GET
Returns all parks currently being tracked.

**Response:**
```json
[
  {
    "id": "uuid",
    "park_code": "acad",
    "name": "Acadia National Park",
    "created_at": "2025-01-02T10:00:00Z"
  }
]
```

---

### `/api/parks/[code]/alerts` - GET
Returns current alerts for a specific park.

**Response:**
```json
{
  "park": {
    "id": "uuid",
    "park_code": "acad",
    "name": "Acadia National Park"
  },
  "currentAlerts": [
    {
      "id": "uuid",
      "nps_alert_id": "123abc",
      "title": "Bear Activity",
      "description": "Increased bear activity...",
      "category": "Caution",
      "url": "https://nps.gov/...",
      "last_updated_by_nps": "2025-01-02T10:00:00Z",
      "fetched_at": "2025-01-02T10:15:00Z"
    }
  ]
}
```

---

### `/api/parks/[code]/history?alertId=123abc` - GET
Returns full timeline for a specific alert.

**Query Parameters:**
- `alertId` (required): The NPS alert ID

**Response:**
```json
{
  "alertId": "123abc",
  "history": [
    {
      "id": "uuid",
      "nps_alert_id": "123abc",
      "title": "Bear Activity",
      "description": "Initial report...",
      "category": "Caution",
      "last_updated_by_nps": "2025-01-01T08:00:00Z",
      "fetched_at": "2025-01-01T08:15:00Z"
    },
    {
      "id": "uuid",
      "nps_alert_id": "123abc",
      "title": "Bear Activity - UPDATED",
      "description": "More bears spotted...",
      "category": "Danger",
      "last_updated_by_nps": "2025-01-02T10:00:00Z",
      "fetched_at": "2025-01-02T10:15:00Z"
    }
  ]
}
```

---

### `/api/poll` - GET (Cron only)
Triggered every 15 minutes by Vercel Cron.

**Auth:** Requires `Authorization: Bearer ${CRON_SECRET}` header

**Response:**
```json
{
  "ok": true,
  "stats": {
    "parksProcessed": 423,
    "alertsInserted": 12,
    "alertsSkipped": 411,
    "totalAlerts": 423
  }
}
```

---

## Pages

### `/` - Home
- Search parks by name or code
- View stats (parks tracked, polling frequency, data source)
- Grid of park cards
- Clickable to view park details

### `/parks/[code]` - Park Detail
- Park name and code
- Current active alerts
- Expandable alert details
- Links to NPS.gov for each alert

---

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## Testing the Polling

To test the `/api/poll` endpoint locally:

```bash
curl -H "Authorization: Bearer your_cron_secret" \
  http://localhost:3000/api/poll
```

---

## Deployment to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Settings → Environment Variables
4. Deploy
5. Cron jobs automatically scheduled via `vercel.json`

Check Cron logs in Vercel dashboard: Settings → Cron Jobs

---

## Cost Estimate

- **Vercel**: $0/month (free tier for hobby projects)
- **Supabase**: ~$5-10/month (free tier has limits, but this project should fit)
  - Database: ~1GB for a year of history
  - API calls: ~96/day (6 per hour × 16 hours) = ~3K/month
- **NPS API**: Free (requires API key registration)

**Total: ~$5-10/month**

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Deploy to Vercel
3. ✅ Monitor first cron run
4. Monitor alert history accumulation
5. (Optional) Enhance park names with full NPS data
6. (Optional) Add timeline visualization
7. (Optional) Add search by alert text/category
