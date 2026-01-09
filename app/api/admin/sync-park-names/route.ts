import { supabase } from '@/lib/supabase'
import parkNameMapping from '@/park-names-mapping.json'

/**
 * Admin endpoint to bulk sync all park names from the static mapping
 * This is useful for updating any parks in the database that don't have full names yet
 * 
 * Usage: POST /api/admin/sync-park-names?key=ADMIN_KEY
 */
export async function POST(req: Request) {
  // Verify admin key
  const url = new URL(req.url)
  const adminKey = url.searchParams.get('key')
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all parks from database
    const { data: parks, error: fetchError } = await supabase
      .from('parks')
      .select('id, park_code, name')
    
    if (fetchError) throw fetchError
    
    if (!parks || parks.length === 0) {
      return Response.json({ ok: true, stats: { updated: 0, total: 0 } })
    }

    console.log(`Found ${parks.length} parks in database`)
    
    const mapping = parkNameMapping as Record<string, string>
    let updated = 0
    let noMapping = 0

    // Update each park with full name from mapping
    for (const park of parks) {
      const fullName = mapping[park.park_code]
      
      if (!fullName) {
        noMapping++
        continue
      }

      if (park.name === fullName) {
        // Already has correct name
        continue
      }

      // Update the park with full name
      const { error: updateError } = await supabase
        .from('parks')
        .update({ name: fullName })
        .eq('id', park.id)

      if (updateError) {
        console.error(`Error updating park ${park.park_code}:`, updateError)
        continue
      }

      updated++
      console.log(`Updated ${park.park_code}: "${park.name}" → "${fullName}"`)
    }

    return Response.json({
      ok: true,
      stats: {
        total: parks.length,
        updated,
        noMapping,
        message: `Successfully updated ${updated} parks`
      }
    })
  } catch (err) {
    console.error('Sync error:', err)
    return Response.json(
      { error: 'Sync failed', details: String(err) },
      { status: 500 }
    )
  }
}
