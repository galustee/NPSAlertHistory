import { supabase } from '@/lib/supabase'

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
}

export async function GET(req: Request) {
  // Verify this is a cron request from Vercel
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch alerts from NPS API
    const npsRes = await fetch(
      `https://developer.nps.gov/api/v1/alerts?api_key=${process.env.NPS_API_KEY}`,
      { cache: 'no-store' }
    )

    if (!npsRes.ok) {
      throw new Error(`NPS API error: ${npsRes.status}`)
    }

    const npsData: NPSResponse = await npsRes.json()

    let parksInserted = 0
    let alertsInserted = 0
    let alertsSkipped = 0

    // Process each alert
    for (const alert of npsData.data) {
      try {
        // 1. Upsert park
        const { data: park, error: parkError } = await supabase
          .from('parks')
          .upsert(
            {
              park_code: alert.parkCode,
              name: alert.parkCode, // Will be enhanced later with full park info
            },
            { onConflict: 'park_code' }
          )
          .select()
          .single()

        if (parkError) throw parkError

        parksInserted++

        // 2. Insert alert history row
        const { error: alertError } = await supabase
          .from('alerts')
          .insert({
            park_id: park.id,
            nps_alert_id: alert.id,
            title: alert.title,
            description: alert.description,
            category: alert.category,
            url: alert.url,
            last_updated_by_nps: alert.lastIndexedDate,
          })

        if (alertError) {
          // If it's a unique constraint violation, that's expected (idempotent)
          if (alertError.code === '23505') {
            alertsSkipped++
          } else {
            throw alertError
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
