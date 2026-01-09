import { supabase } from '@/lib/supabase'
import parkNameMapping from '@/park-names-mapping.json'
import parkDesignationMapping from '@/park-designations-mapping.json'

interface NPSAlert {
  parkCode: string
  title: string
  description: string
  category: string
  url: string
  lastIndexedDate: string
  id: string
}

interface NPSResponse {
  data: NPSAlert[]
  total?: string
  limit?: string
  start?: string
}

// Cache for park names to avoid repeated lookups
const parkNameCache: Map<string, string> = new Map()
const parkDesignationCache: Map<string, string> = new Map()

function getParkFullName(parkCode: string): string {
  // Check cache first
  if (parkNameCache.has(parkCode)) {
    return parkNameCache.get(parkCode)!
  }

  // Look up in the static mapping (generated once from NPS API)
  const mapping = parkNameMapping as Record<string, string>
  const fullName = mapping[parkCode] || parkCode

  // Cache the result
  parkNameCache.set(parkCode, fullName)

  return fullName
}

function getParkDesignation(parkCode: string): string | null {
  // Check cache first
  if (parkDesignationCache.has(parkCode)) {
    return parkDesignationCache.get(parkCode)!
  }

  // Look up in the static mapping
  const mapping = parkDesignationMapping as Record<string, string>
  const designation = mapping[parkCode] || null

  // Cache the result
  if (designation) {
    parkDesignationCache.set(parkCode, designation)
  }

  return designation
}

export async function GET(req: Request) {
  // Verify this is a cron request from Vercel
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch alerts from NPS API with pagination (limited for Vercel free tier 10s timeout)
    let allAlerts: NPSAlert[] = []
    let start = 0
    const limit = 500 // Try larger batches to reduce pagination calls
    const maxPages = 2 // With 500 per page, 2 pages = 1000 alerts (covers all ~661)
    let pagesFetched = 0
    let hasMore = true

    while (hasMore && pagesFetched < maxPages) {
      const npsRes = await fetch(
        `https://developer.nps.gov/api/v1/alerts?limit=${limit}&start=${start}&api_key=${process.env.NPS_API_KEY}`,
        { cache: 'no-store' }
      )

      if (!npsRes.ok) {
        throw new Error(`NPS API error: ${npsRes.status}`)
      }

      const npsData: NPSResponse = await npsRes.json()
      allAlerts = allAlerts.concat(npsData.data)
      pagesFetched++

      // Check if there are more results
      const total = parseInt(npsData.total || '0')
      start += limit
      hasMore = start < total
    }

    // Create a response object matching the expected format
    const npsData = { data: allAlerts, total: String(allAlerts.length) }

    let parksInserted = 0
    let alertsInserted = 0
    let alertsUpdated = 0
    let alertsSkipped = 0

    // Track which parks we're processing in this run
    const parksInFeed = new Set<string>()
    for (const alert of npsData.data) {
      parksInFeed.add(alert.parkCode)
    }

    // Step 1: Batch upsert all parks first
    const uniqueParks = Array.from(parksInFeed).map(parkCode => ({
      park_code: parkCode,
      name: getParkFullName(parkCode),
      designation: getParkDesignation(parkCode),
    }))

    await supabase
      .from('parks')
      .upsert(uniqueParks, { onConflict: 'park_code', ignoreDuplicates: false })

    // Step 2: Get all park IDs in one query
    const { data: parks } = await supabase
      .from('parks')
      .select('id, park_code')
      .in('park_code', Array.from(parksInFeed))

    const parkCodeToId = new Map<string, string>()
    parks?.forEach(park => parkCodeToId.set(park.park_code, park.id))

    // Step 3: Mark alerts as inactive for these parks (batch)
    const parkIds = Array.from(parkCodeToId.values())
    if (parkIds.length > 0) {
      await supabase
        .from('alerts')
        .update({ is_active: false })
        .in('park_id', parkIds)
        .eq('is_active', true)
    }

    // Step 4: Prepare alerts for batch insert
    const seenAlerts = new Set<string>()
    const alertsToInsert = []

    for (const alert of npsData.data) {
      const parkId = parkCodeToId.get(alert.parkCode)
      if (!parkId) continue

      const alertKey = `${parkId}:${alert.id}`
      if (seenAlerts.has(alertKey)) {
        alertsSkipped++
        continue
      }
      seenAlerts.add(alertKey)

      alertsToInsert.push({
        park_id: parkId,
        nps_alert_id: alert.id,
        title: alert.title,
        description: alert.description,
        category: alert.category,
        url: alert.url,
        last_updated_by_nps: alert.lastIndexedDate,
        is_active: true,
      })
    }

    // Step 5: Batch insert alerts (on conflict do nothing, then batch update active status)
    if (alertsToInsert.length > 0) {
      const { data: inserted } = await supabase
        .from('alerts')
        .insert(alertsToInsert)
        .select('nps_alert_id')

      alertsInserted = inserted?.length || 0

      // For all alerts in this batch, mark matching ones as active (batch update by nps_alert_id)
      const npsAlertIds = alertsToInsert.map(a => a.nps_alert_id)
      if (npsAlertIds.length > 0) {
        await supabase
          .from('alerts')
          .update({ is_active: true })
          .in('nps_alert_id', npsAlertIds)
          .in('park_id', parkIds)

        alertsUpdated = alertsToInsert.length - alertsInserted
      }
    }

    parksInserted = uniqueParks.length

    return Response.json({
      ok: true,
      stats: {
        parksProcessed: parksInserted,
        alertsInserted,
        alertsUpdated,
        alertsSkipped,
        totalAlerts: npsData.data.length,
      },
    })
  } catch (err) {
    console.error('Polling error:', err)
    return Response.json(
      { error: 'Polling failed', details: String(err) },
      { status: 500 }
    )
  }
}
