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
    const { searchParams } = new URL(req.url)
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return Response.json(
        { error: 'alertId parameter required' },
        { status: 400 }
      )
    }

    // Get park
    const { data: park, error: parkError } = await supabase
      .from('parks')
      .select('id')
      .eq('park_code', code)
      .single()

    if (parkError) {
      return Response.json(
        { error: 'Park not found' },
        { status: 404 }
      )
    }

    // Get full alert history for this alert ID
    const { data: history, error: historyError } = await supabase
      .from('alerts')
      .select('*')
      .eq('park_id', park.id)
      .eq('nps_alert_id', alertId)
      .order('fetched_at', { ascending: false })

    if (historyError) throw historyError

    return Response.json({
      alertId,
      history,
    })
  } catch (err) {
    console.error('Error fetching alert history:', err)
    return Response.json(
      { error: 'Failed to fetch alert history' },
      { status: 500 }
    )
  }
}
