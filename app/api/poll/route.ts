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
    // Fetch ALL alerts from NPS API with pagination
    let allAlerts: NPSAlert[] = []
    let start = 0
    const limit = 50 // API default/max
    let hasMore = true

    while (hasMore) {
      const npsRes = await fetch(
        `https://developer.nps.gov/api/v1/alerts?limit=${limit}&start=${start}&api_key=${process.env.NPS_API_KEY}`,
        { cache: 'no-store' }
      )

      if (!npsRes.ok) {
        throw new Error(`NPS API error: ${npsRes.status}`)
      }

      const npsData: NPSResponse = await npsRes.json()
      allAlerts = allAlerts.concat(npsData.data)

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

    // Step 1: Mark alerts as inactive ONLY for parks in this NPS API response
    // (This ensures we don't incorrectly mark alerts inactive for parks not in the feed)
    for (const parkCode of parksInFeed) {
      const { data: park } = await supabase
        .from('parks')
        .select('id')
        .eq('park_code', parkCode)
        .single()

      if (park) {
        await supabase
          .from('alerts')
          .update({ is_active: false })
          .eq('park_id', park.id)
          .eq('is_active', true)
      }
    }

    // Step 2: Process each alert from NPS API
    const seenAlerts = new Set<string>() // Track which park+alert combos we've seen

    for (const alert of npsData.data) {
      try {
        // Get full park name and designation from static mappings
        const fullParkName = getParkFullName(alert.parkCode)
        const designation = getParkDesignation(alert.parkCode)

        // 1. Upsert park with full name and designation
        const { data: park, error: parkError } = await supabase
          .from('parks')
          .upsert(
            {
              park_code: alert.parkCode,
              name: fullParkName,
              designation: designation,
            },
            { 
              onConflict: 'park_code',
              ignoreDuplicates: false // Ensure we update the fields if park exists
            }
          )
          .select()
          .single()

        if (parkError) throw parkError

        parksInserted++

        const alertKey = `${park.id}:${alert.id}`
        if (seenAlerts.has(alertKey)) {
          alertsSkipped++
          continue // Skip duplicates in same run
        }
        seenAlerts.add(alertKey)

        // 2. Try to insert new alert row (for history tracking)
        const { error: insertError } = await supabase
          .from('alerts')
          .insert({
            park_id: park.id,
            nps_alert_id: alert.id,
            title: alert.title,
            description: alert.description,
            category: alert.category,
            url: alert.url,
            last_updated_by_nps: alert.lastIndexedDate,
            is_active: true,
          })

        if (insertError) {
          // If unique constraint violation, update existing rows to mark as active
          if (insertError.code === '23505') {
            const { error: updateError } = await supabase
              .from('alerts')
              .update({ is_active: true })
              .eq('park_id', park.id)
              .eq('nps_alert_id', alert.id)

            if (updateError) {
              console.error('Error updating alert:', updateError)
            } else {
              alertsUpdated++
            }
          } else {
            throw insertError
          }
        } else {
          alertsInserted++
        }
      } catch (err) {
        console.error(`Error processing alert ${alert.id}:`, err)
      }
    }

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
