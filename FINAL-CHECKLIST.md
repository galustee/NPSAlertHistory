# 📋 Deployment Checklist (Visual)

## ✅ Pre-Deployment

### Code Quality
- [x] TypeScript compiles without errors
- [x] Build succeeds locally (`npm run build`)
- [x] All imports resolved
- [x] No ESLint warnings
- [x] All dependencies installed

### Files Created
- [x] `app/page.tsx` - Home page
- [x] `app/parks/[code]/page.tsx` - Park detail page
- [x] `app/api/poll/route.ts` - Polling endpoint
- [x] `app/api/parks/route.ts` - Parks API
- [x] `app/api/parks/[code]/alerts/route.ts` - Alerts API
- [x] `app/api/parks/[code]/history/route.ts` - History API
- [x] `vercel.json` - Cron configuration
- [x] `package.json` - Dependencies (with lucide-react added)

### Documentation
- [x] `README.md` - Project overview
- [x] `QUICK-REFERENCE.md` - Quick facts and reference
- [x] `SETUP.md` - Detailed setup guide
- [x] `DEPLOYMENT.md` - Deploy checklist
- [x] `PROJECT-SUMMARY.md` - Project summary
- [x] `IMPLEMENTATION-DETAILS.md` - Implementation details
- [x] `DOCS-INDEX.md` - Documentation index
- [x] `00-START-HERE.md` - Entry point

---

## 📦 Environment Setup (Do This)

### Before Local Testing
```
❌ → ✅ Create .env.local file with:
        SUPABASE_URL=your_url
        SUPABASE_SERVICE_KEY=your_key
        NPS_API_KEY=your_key
        CRON_SECRET=your_secret
```

### Before Deployment
```
❌ → ✅ Verify in Vercel Dashboard:
        Settings → Environment Variables
        Production environment has 4 variables:
        - SUPABASE_URL
        - SUPABASE_SERVICE_KEY
        - NPS_API_KEY
        - CRON_SECRET
```

---

## 🗄️ Database Setup (Do This)

### Supabase Project
```
❌ → ✅ Created tables:
        - parks (with park_code unique index)
        - alerts (with unique constraint + indexes)
        
❌ → ✅ Verified in SQL Editor that tables exist

❌ → ✅ Got credentials:
        - SUPABASE_URL
        - SUPABASE_SERVICE_KEY (Service Role Key)
```

---

## 🔑 API Keys (Do This)

### NPS Developer API
```
❌ → ✅ Registered at https://developer.nps.gov
❌ → ✅ Got NPS_API_KEY
❌ → ✅ Tested key works
```

### Cron Secret
```
❌ → ✅ Generated random string (openssl rand -hex 32)
❌ → ✅ Saved as CRON_SECRET
```

---

## 🚀 Deployment Steps (Do This)

### Step 1: Push Code
```bash
❌ git add .
❌ git commit -m "NPS alerts history"
❌ git push

✅ Code is now on GitHub
```

### Step 2: Create Vercel Project
```
❌ → ✅ Visit https://vercel.com/dashboard
❌ → ✅ Click "Add New" → "Project"
❌ → ✅ Select your GitHub repo
❌ → ✅ Click "Import"
```

### Step 3: Add Environment Variables
```
❌ → ✅ In Vercel import dialog:
        Click "Environment Variables"
        
        Add these 4 variables:
        ❌ SUPABASE_URL
        ❌ SUPABASE_SERVICE_KEY
        ❌ NPS_API_KEY
        ❌ CRON_SECRET
        
        ✅ All variables set
```

### Step 4: Deploy
```
❌ → ✅ Click "Deploy"
❌ → ✅ Wait for build to complete (2-3 min)
❌ → ✅ See "Deployment complete"
```

---

## ✔️ Post-Deployment Verification

### Website Live
```
❌ → ✅ Visit your project URL:
        https://[your-project].vercel.app
        
❌ → ✅ Home page loads
❌ → ✅ No errors in console
```

### Cron Job Running
```
❌ → ✅ Go to Vercel dashboard
❌ → ✅ Settings → Cron Jobs
❌ → ✅ See /api/poll listed
❌ → ✅ Wait for 15-minute window
❌ → ✅ See execution in logs
```

### Data in Database
```
❌ → ✅ Go to Supabase dashboard
❌ → ✅ SQL Editor
❌ → ✅ Run: SELECT COUNT(*) FROM parks;
❌ → ✅ See count > 0
❌ → ✅ Run: SELECT COUNT(*) FROM alerts;
❌ → ✅ See count > 0
```

### API Endpoints
```
❌ → ✅ Test in browser or curl:
        GET https://[your-project].vercel.app/api/parks
        
❌ → ✅ See JSON array of parks
❌ → ✅ Each park has: id, park_code, name, created_at
```

### Home Page Shows Parks
```
❌ → ✅ Visit home page
❌ → ✅ See parks grid populated
❌ → ✅ Search functionality works
❌ → ✅ Park count shows > 0
```

### Park Detail Page
```
❌ → ✅ Click a park (e.g., "Acadia")
❌ → ✅ Page loads with park name
❌ → ✅ See "X alerts" message
❌ → ✅ If alerts exist, see alert cards
❌ → ✅ Can expand alerts to see details
❌ → ✅ "View on NPS.gov" link works
```

---

## 📊 Monitoring (Weekly)

```
Every week:
❌ → ✅ Check Vercel dashboard
        - Cron jobs have been running
        - No error logs
        
❌ → ✅ Check Supabase
        - Alert count increased
        - No failed queries
        
❌ → ✅ Visit home page
        - Parks still displaying
        - No errors
        
❌ → ✅ Test one park page
        - Alerts showing
        - All links work
```

---

## 🔴 Troubleshooting Checklist

### Build Fails
```
❌ Did you run npm install?
   → Run: npm install

❌ Are environment variables wrong?
   → Check .env.local syntax
   → Verify keys are correct
   
❌ Is TypeScript failing?
   → Run: npx tsc --noEmit
   → Fix any type errors
```

### Website Loads But Empty
```
❌ Has first cron run happened?
   → Check Vercel Cron Jobs logs
   → Wait up to 15 minutes
   
❌ Are API keys valid?
   → Test NPS API key directly
   → Check Supabase credentials
   
❌ Did cron job fail?
   → Check Vercel logs
   → Verify CRON_SECRET matches
```

### Parks Show But No Alerts
```
❌ Is data in database?
   → Check SELECT COUNT(*) FROM alerts
   
❌ Did cron fail?
   → Check Vercel Cron Jobs logs
   
❌ Is fetch timing out?
   → Check NPS API directly
   → Check database connection
```

### Specific Park Page Won't Load
```
❌ Does park_code exist?
   → Check database: SELECT * FROM parks WHERE park_code='acad'
   
❌ Is fetch call failing?
   → Check browser console errors
   → Check API endpoint: /api/parks/acad/alerts
```

---

## 🎯 Success Indicators

When all of these are TRUE, you're done! ✅

```
✅ npm run build completes successfully
✅ Website deployed to Vercel URL
✅ Cron jobs visible in Vercel dashboard
✅ First cron job ran (check logs)
✅ Parks table has > 0 rows
✅ Alerts table has > 0 rows
✅ Home page loads with park grid
✅ Can click a park and see details
✅ Alerts display with timestamps
✅ Dark mode toggle works
✅ Search filters parks
✅ All links work (back, NPS.gov, etc.)
✅ No errors in browser console
✅ No errors in Vercel logs
✅ API endpoints return JSON
```

---

## 📅 Timeline

```
Day 1: Setup
  ├─ Get API keys (NPS, Supabase)
  ├─ Create Supabase project and tables
  ├─ Create .env.local locally
  ├─ Test locally with npm run dev
  └─ Time: ~45 minutes

Day 2: Deploy
  ├─ Push to GitHub
  ├─ Create Vercel project
  ├─ Add environment variables
  ├─ Deploy
  └─ Time: ~15 minutes

Day 3: Verify
  ├─ Monitor first cron run
  ├─ Check data in database
  ├─ Test all pages and endpoints
  └─ Time: ~20 minutes

Day 4+: Monitor & Enjoy
  ├─ Watch data accumulate
  ├─ Share with friends
  ├─ Monitor weekly
  └─ Cost: ~$5-10/month
```

---

## 🎉 You're Done When...

```
You have checked all these boxes:

Pre-Deployment
  ☑ Code builds successfully
  ☑ All documentation read
  
Environment Setup
  ☑ API keys obtained and valid
  ☑ Environment variables set (local and Vercel)
  
Deployment
  ☑ Code pushed to GitHub
  ☑ Vercel project created
  ☑ Environment variables added to Vercel
  ☑ Deployed successfully
  
Post-Deployment
  ☑ Website live and loading
  ☑ First cron run completed
  ☑ Data in Supabase database
  ☑ Parks showing on home page
  ☑ Park detail pages working
  ☑ All APIs responding
  
Monitoring
  ☑ Cron jobs running every 15 min
  ☑ New data accumulating daily
  ☑ No errors in logs
  ☑ Website stable and fast

🎉 READY FOR PRODUCTION!
```

---

## 🚀 Quick Status Check

```bash
# Local development
npm run dev
# → Open http://localhost:3000
# → Check home page loads with search
# → Click a park (will be empty until deployment)

# Before pushing
npm run build
# → Should complete with ✅

# After deployment
# → Visit https://[your-project].vercel.app
# → Should see parks after first cron run (wait 15 min)
# → Test park page (click a park)
# → Success! 🎉
```

---

**You've got this! Follow the steps, check the boxes, and launch! 🚀**
