import { supabase } from '@/lib/supabase'

interface Params {
  code: string
}

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { code } = await params

    // Get park
    const { data: park, error: parkError } = await supabase
      .from('parks')
      .select('id, park_code, name')
      .eq('park_code', code)
      .single()

    if (parkError) {
      return Response.json(
        { error: 'Park not found' },
        { status: 404 }
      )
    }

    // Get current alerts (most recent per alert ID)
    const { data: alerts, error: alertError } = await supabase
      .from('alerts')
      .select('*')
      .eq('park_id', park.id)
      .order('nps_alert_id')
      .order('fetched_at', { ascending: false })

    if (alertError) throw alertError

    // Group by nps_alert_id and get only the most recent
    const currentAlerts = new Map()
    for (const alert of alerts) {
      if (!currentAlerts.has(alert.nps_alert_id)) {
        currentAlerts.set(alert.nps_alert_id, alert)
      }
    }

    return Response.json({
      park,
      currentAlerts: Array.from(currentAlerts.values()),
    })
  } catch (err) {
    console.error('Error fetching alerts:', err)
    return Response.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
