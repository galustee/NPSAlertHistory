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

    if (uniqueParks.length > 0) {
      const { error: upsertError } = await supabase
        .from('parks')
        .upsert(uniqueParks, { onConflict: 'park_code', ignoreDuplicates: false })

      if (upsertError) {
        console.error('Parks upsert error:', upsertError)
        throw upsertError
      }
    }

    // Step 2: Get all park IDs in one query
    const { data: parks, error: parksError } = await supabase
      .from('parks')
      .select('id, park_code')

    if (parksError) {
      console.error('Parks query error:', parksError)
      throw parksError
    }

    const parkCodeToId = new Map<string, string>()
    parks?.forEach(park => parkCodeToId.set(park.park_code, park.id))
    const parkIds = Array.from(parkCodeToId.values())

    // Step 3: Get ALL existing active alerts to deactivate those not in current feed
    const { data: existingAlerts, error: alertsError } = await supabase
      .from('alerts')
      .select('id, park_id, nps_alert_id, is_active')
      .eq('is_active', true)

    if (alertsError) {
      console.error('Existing alerts query error:', alertsError)
      throw alertsError
    }

    // Track which alert IDs are in the current NPS feed
    const npsAlertsByPark = new Map<string, Set<string>>()
    for (const alert of npsData.data) {
      if (!npsAlertsByPark.has(alert.parkCode)) {
        npsAlertsByPark.set(alert.parkCode, new Set())
      }
      npsAlertsByPark.get(alert.parkCode)!.add(alert.id)
    }

    // Mark ALL active alerts as inactive if they're not in the current NPS feed
    if (existingAlerts && existingAlerts.length > 0 && parks && parks.length > 0) {
      const alertsToDeactivate: string[] = []
      
      for (const alert of existingAlerts) {
        // Get the park code for this alert
        const park = parks.find(p => p.id === alert.park_id)
        if (!park) continue
        
        const npsAlertIds = npsAlertsByPark.get(park.park_code) || new Set()
        
        // If this alert is not in the current NPS feed, mark it for deactivation
        if (!npsAlertIds.has(alert.nps_alert_id)) {
          alertsToDeactivate.push(alert.id)
        }
      }

      // Batch deactivate all alerts not in current feed
      if (alertsToDeactivate.length > 0) {
        const { error: deactivateError } = await supabase
          .from('alerts')
          .update({ is_active: false })
          .in('id', alertsToDeactivate)
        
        if (deactivateError) {
          console.error('Deactivation error:', deactivateError)
          throw deactivateError
        }
      }
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

    // Step 5: Batch upsert alerts - insert new ones, update existing to is_active=true
    if (alertsToInsert.length > 0) {
      const { error } = await supabase
        .from('alerts')
        .upsert(alertsToInsert, {
          onConflict: 'park_id,nps_alert_id,last_updated_by_nps',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Upsert error:', error)
        throw error
      }

      // Report the count of alerts we processed
      alertsInserted = alertsToInsert.length
      alertsUpdated = 0
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
