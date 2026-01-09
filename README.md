# NPS Alert History

Track historical alerts for U.S. National Parks. The NPS API only shows current alerts - this app preserves the complete timeline.

## Features

- 📊 **Complete History** - Daily snapshots of all park alerts
- 🔍 **Park Designations** - Filter by National Park, Monument, Historic Site, etc.
- 🎨 **Modern UI** - Responsive design with dark mode
- ⚡ **Active/Inactive Tracking** - See which alerts are currently posted vs. archived
- 🔄 **Daily Updates** - Automated polling at 9 AM UTC via Vercel Cron

## Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Vercel Cron
- **Database**: Supabase (PostgreSQL)
- **Data Source**: NPS Developer API

## Quick Start

```bash
# Install dependencies
npm install

# Set up .env.local with your keys
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
NPS_API_KEY=...
CRON_SECRET=...

# Run dev server
npm run dev
```

## Database Schema

```sql
-- Parks table
CREATE TABLE parks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  park_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  designation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table (append-only history)
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  park_id UUID REFERENCES parks(id),
  nps_alert_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  url TEXT,
  last_updated_by_nps TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  fetched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(park_id, nps_alert_id, last_updated_by_nps)
);
```

## API Endpoints

- `GET /api/parks` - List all parks
- `GET /api/parks/[code]/alerts` - Get active/inactive alerts for a park
- `GET /api/parks/[code]/history?alertId=...` - Get full history for an alert
- `GET /api/poll` - Cron job endpoint (secured with bearer token)

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Configure cron: `0 9 * * *` (daily at 9 AM UTC) → `/api/poll`

## License

MIT
