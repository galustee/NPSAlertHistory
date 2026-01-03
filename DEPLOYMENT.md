# Deployment Checklist

## Before You Deploy

- [ ] All environment variables set in `.env.local` locally (for testing)
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Supabase project created and tables set up
- [ ] NPS API key generated
- [ ] Random CRON_SECRET generated

## Vercel Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial NPS alerts history project"
git push origin main
```

### 2. Create Vercel Project
- Go to https://vercel.com/dashboard
- Click "Add New" → "Project"
- Select your GitHub repository
- Click "Import"

### 3. Configure Environment Variables
In the import dialog, add these variables:

**Production Environment:**
```
SUPABASE_URL = [your Supabase URL]
SUPABASE_SERVICE_KEY = [your Service Role Key]
NPS_API_KEY = [your NPS API key]
CRON_SECRET = [random string, e.g., from `openssl rand -hex 32`]
```

**Development Environment (optional):**
```
SUPABASE_URL = [your Supabase URL]
SUPABASE_SERVICE_KEY = [your Service Role Key]
NPS_API_KEY = [your NPS API key]
CRON_SECRET = [same random string]
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete (should take ~2-3 minutes)

### 5. Verify Deployment
- Your site is now live at: `https://[your-project].vercel.app`
- Check that home page loads
- Try clicking a park (data will appear after first cron run)

## After Deployment

### Monitor First Cron Run
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Cron Jobs
4. Wait for next 15-minute interval (or manual trigger if available)
5. Check execution logs to verify success

**Expected first run:**
```json
{
  "ok": true,
  "stats": {
    "parksProcessed": 423,
    "alertsInserted": 423,
    "alertsSkipped": 0,
    "totalAlerts": 423
  }
}
```

### Verify Data in Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Run:
   ```sql
   SELECT COUNT(*) FROM parks;
   SELECT COUNT(*) FROM alerts;
   ```
5. Should show populated counts after first cron run

### Test Endpoints
Open these in your browser after first cron run:
- `https://[your-project].vercel.app/api/parks`
- `https://[your-project].vercel.app/api/parks/acad/alerts` (example park code)

## Ongoing Monitoring

### Weekly Checks
- [ ] Cron jobs have been running (check logs)
- [ ] No alert errors in logs
- [ ] Alert count increasing over time (sign data is accumulating)

### If Cron Not Running
1. Check Vercel status page for outages
2. Verify CRON_SECRET matches what's configured
3. Check Supabase database is accessible
4. Review error logs in Vercel dashboard

### If No Data Appearing
1. Verify NPS API key is valid (test with curl)
2. Check Supabase credentials are correct
3. Verify database tables exist with correct schema
4. Check logs for any parsing errors

## Troubleshooting

### Build Failing on Vercel
```bash
# Test locally
npm run build
npm run lint
npx tsc --noEmit
```

If it passes locally but fails on Vercel:
- Check Node.js version matches (16+)
- Try: Settings → Build Settings → Clear Build Cache & Deploy

### Cron Jobs Not Triggering
- Ensure `vercel.json` is in root directory
- Check cron schedule is valid (*/15 * * * * = every 15 minutes)
- Verify project is on Pro plan or higher (free tier has limitations)

### Database Quota Issues
- Monitor Supabase database size in project settings
- Check if hitting API rate limits
- Consider archiving old alerts if data grows too large

## Rollback

If something goes wrong:

```bash
# Revert last commit
git revert HEAD
git push

# Or switch to previous commit
git reset --hard [commit-hash]
git push --force
```

## Success Indicators

✅ Home page loads with parks  
✅ Cron jobs run every 15 minutes without error  
✅ New parks and alerts appearing in database  
✅ Alert detail pages load with correct data  
✅ Supabase metrics show steady query volume  

## Questions?

Check the SETUP.md for more detailed API docs and configuration help.
