# Feature Testing Guide - Alert History & Active Status

## Quick Overview

Your application now has two major UI enhancements:

1. **Active Status Badges** - Green "Active" label on all current alerts
2. **Alert History Timeline** - Expandable timeline showing all past versions of an alert

---

## Testing the Features Locally

### Prerequisites
- ✅ Development server running: `npm run dev`
- ✅ Database has some parks and alerts
- ⚠️ If no data: Manually trigger polling endpoint first

### Step 1: Populate Test Data

If your database is empty, trigger the polling endpoint manually:

```bash
# Open a new terminal/PowerShell and run:
curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y7zu" `
  http://localhost:3000/api/poll
```

Expected response:
```json
{
  "ok": true,
  "stats": {
    "parksProcessed": 52,
    "alertsInserted": 145,
    "alertsSkipped": 0,
    "totalAlerts": 145
  }
}
```

---

## Testing Feature 1: Active Status Badges

### What to Look For:
1. Open `http://localhost:3000` in your browser
2. Click on any park with alerts
3. In the Park Details page, each alert card should have:
   - ✅ Green badge with checkmark icon
   - ✅ Text saying "Active"
   - ✅ Badge positioned next to the category badge (red/yellow/blue)

### Example Visual:
```
┌─────────────────────────────────────┐
│ [Danger]  [✓ Active]                │
│ Road Closure on Park Loop Road      │
│ Updated 1/9/2026                    │
└─────────────────────────────────────┘
```

### Responsive Check:
- Mobile (320px): Badge stacks nicely ✓
- Tablet (768px): Badges side-by-side ✓
- Desktop (1024px+): Full spacing ✓

---

## Testing Feature 2: Alert History Timeline

### Prerequisites:
- Need alerts with multiple versions in the database
- First time: Manually trigger polling twice to create versions
  ```bash
  # First trigger (creates v1)
  curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y7zu" \
    http://localhost:3000/api/poll
  
  # Wait 30 seconds
  
  # Second trigger (creates v2)
  curl -H "Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y7zu" \
    http://localhost:3000/api/poll
  ```

### What to Look For:
1. Navigate to a park with alerts
2. Click on an alert to expand it
3. Scroll down in the expanded alert card
4. You should see: "Alert History (N versions)" button

### If Timeline Shows:
✅ Click the timeline button to expand
✅ Visual timeline with:
  - Vertical line connecting versions
  - Blue dots for each version
  - Timestamps for each update
  - "(Current)" badge on latest version
  - Alert title snippets

### Example Visual:
```
▼ Alert History (3 versions)

● 1/9/2026, 2:30 PM
  (Current)
  Road closure on main loop - updated...

● 1/8/2026, 11:45 AM
  Road closure on main loop - partially...

● 1/7/2026, 9:15 AM
  Road closure on main loop - initial...
```

### Interactive Testing:
- ✓ Click "▼ Alert History" to collapse timeline
- ✓ Click "▶ Alert History" to expand timeline
- ✓ Timeline should show chronologically (newest to oldest)
- ✓ Current version clearly marked

---

## Testing Dark Mode

### Activation:
1. Toggle dark mode in your browser DevTools or system settings
2. Check that:
   - ✅ Active badge colors are readable
   - ✅ Timeline colors contrast properly
   - ✅ Timeline dots are visible
   - ✅ Timeline connector lines are visible

### Expected Dark Mode Colors:
- Background: Dark slate gray
- Badge: Green with darker border
- Timeline dots: Blue
- Timeline lines: Medium gray
- Text: Light text on dark background

---

## Testing Responsive Design

### Mobile (320px width):
```bash
# Open DevTools (F12)
# Toggle device toolbar (Ctrl+Shift+M)
# Select "iPhone 12/13"
```

Expected:
- ✓ Alert cards stack vertically
- ✓ Badges wrap nicely
- ✓ Timeline displays clearly
- ✓ No horizontal scrolling

### Tablet (768px):
- ✓ Cards wider but still clear
- ✓ Badges side-by-side
- ✓ Timeline readable

### Desktop (1920px+):
- ✓ Cards at full width with padding
- ✓ All elements clearly visible
- ✓ Hover effects work smoothly

---

## Testing API Integration

### Check Park Names Were Enhanced:

```bash
# In your browser console or Postman:
fetch('http://localhost:3000/api/parks')
  .then(r => r.json())
  .then(d => console.table(d.parks))
```

Look for:
- ✓ Before: `{ park_code: "acad", name: "acad" }`
- ✓ After: `{ park_code: "acad", name: "Acadia National Park" }`

### Check Alert History Endpoint:

```bash
# Get a park code from the home page, e.g., "acad"
# Get an alert ID from park details page
fetch('http://localhost:3000/api/parks/acad/history?alertId=<alert-id>')
  .then(r => r.json())
  .then(d => console.log(d.versions))
```

Expected:
```json
{
  "versions": [
    {
      "id": "...",
      "title": "Road Closure",
      "description": "...",
      "last_updated_by_nps": "2026-01-09T...",
      "fetched_at": "2026-01-09T..."
    },
    // ... older versions
  ]
}
```

---

## Common Issues & Solutions

### Issue 1: Timeline Not Showing
**Symptom:** Alert expands but "Alert History" section is missing

**Possible Causes:**
- Only 1 version exists (timeline only shows if 2+ versions)
- API error fetching history

**Solution:**
1. Trigger polling endpoint twice (with 30 sec delay)
2. Check browser console for errors (F12 → Console)
3. Verify API endpoint: `curl http://localhost:3000/api/parks/<code>/history?alertId=<id>`

### Issue 2: Park Names Still Show Codes
**Symptom:** Parks display "acad" instead of "Acadia National Park"

**Possible Causes:**
- NPS Parks API is down
- Polling hasn't run since code update

**Solution:**
1. Manually trigger polling: `curl -H "Authorization: Bearer ..." http://localhost:3000/api/poll`
2. Check if park names update in home page
3. Check NPS Parks API: `https://developer.nps.gov/api/v1/parks?codes=acad&api_key=<key>`

### Issue 3: Badges Not Showing
**Symptom:** Active badge missing on alert cards

**Possible Causes:**
- Build didn't recompile
- Browser cache

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check build output: `npm run build`
3. Restart dev server: `npm run dev`

### Issue 4: Timeline UI Broken
**Symptom:** Timeline dots/lines not visible or misaligned

**Possible Causes:**
- Tailwind CSS not compiling properly
- Browser cache

**Solution:**
1. Hard refresh page
2. Check Tailwind classes are defined: `npm run dev`
3. Clear browser cache (DevTools → Storage → Clear All)

---

## Performance Expectations

### Page Load Times:
- Home page: < 1 second
- Park detail page: < 1.5 seconds
- Alert expansion: Instant (UI already rendered)
- History expansion: < 500ms (API call)

### API Calls:
- Home page: 1 call (`/api/parks`)
- Park detail: 1 call (`/api/parks/[code]/alerts`)
- History expansion: 1 call per alert (`/api/parks/[code]/history?alertId=...`)

### Browser Memory:
- Should stay under 50MB for normal usage
- History cache clears on page reload

---

## Deployment Verification

Once deployed to Vercel, test these URLs:

1. **Home Page:**
   ```
   https://your-domain.vercel.app/
   ```

2. **Park Detail (example):**
   ```
   https://your-domain.vercel.app/parks/acad
   ```

3. **API Endpoints:**
   ```
   https://your-domain.vercel.app/api/parks
   https://your-domain.vercel.app/api/parks/acad/alerts
   ```

---

## Feedback & Next Steps

After testing, consider:

1. ✅ Features working as expected?
2. ✅ Performance acceptable?
3. ✅ Responsive design good on all devices?
4. ✅ Ready to deploy?

If "Yes" to all, proceed with deployment!

```bash
git add .
git commit -m "Feature: Alert history timeline and active status badges"
git push origin main
```

Vercel will auto-deploy your changes.

---

## Need Help?

Check these files for more details:
- **`IMPLEMENTATION-CHANGELOG.md`** - Technical changes
- **`IMPLEMENTATION-DETAILS.md`** - Architecture
- **`QUICK-REFERENCE.md`** - API reference
- **`DEPLOYMENT.md`** - Deployment guide
