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
      .select('id, park_code, name, designation')
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
      .order('last_updated_by_nps', { ascending: false })

    if (alertError) throw alertError

    // Group by nps_alert_id and get only the most recent
    const allAlertsMap = new Map()
    for (const alert of alerts) {
      if (!allAlertsMap.has(alert.nps_alert_id)) {
        allAlertsMap.set(alert.nps_alert_id, alert)
      }
    }

    const allAlerts = Array.from(allAlertsMap.values())
    
    // Filter alerts by is_active flag
    const activeAlerts = allAlerts.filter(alert => alert.is_active === true)
    const inactiveAlerts = allAlerts.filter(alert => alert.is_active === false)

    return Response.json({
      park,
      currentAlerts: activeAlerts,
      inactiveAlerts: inactiveAlerts,
    })
  } catch (err) {
    console.error('Error fetching alerts:', err)
    return Response.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
