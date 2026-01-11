import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get recent alert activity (when alerts were first fetched or last updated)
    const { data: recentAlerts, error } = await supabase
      .from('alerts')
      .select(`
        id,
        nps_alert_id,
        title,
        description,
        category,
        url,
        last_updated_by_nps,
        fetched_at,
        is_active,
        park_id,
        parks (
          park_code,
          name,
          designation
        )
      `)
      .order('fetched_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Group alerts by fetched_at timestamp to show activity batches
    const activityFeed = recentAlerts?.map(alert => ({
      ...alert,
      park: alert.parks,
    })) || []

    return NextResponse.json({
      alerts: activityFeed,
      total: activityFeed.length,
      hasMore: activityFeed.length === limit
    })
  } catch (err) {
    console.error('Error fetching alert feed:', err)
    return NextResponse.json(
      { error: 'Failed to fetch alert feed' },
      { status: 500 }
    )
  }
}
