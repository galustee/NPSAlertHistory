import { createClient } from '@supabase/supabase-js'
import parkNameMapping from '../park-names-mapping.json'

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function updateParkNames() {
  console.log('🔄 Updating park names from mapping...\n')

  try {
    // Get all parks from database
    const { data: parks, error: fetchError } = await supabase
      .from('parks')
      .select('id, park_code, name')
      .order('park_code')

    if (fetchError) throw fetchError

    console.log(`📋 Found ${parks?.length || 0} parks in database\n`)

    let updated = 0
    let skipped = 0

    const mapping = parkNameMapping as Record<string, string>

    for (const park of parks || []) {
      const fullName = mapping[park.park_code]
      
      if (!fullName) {
        console.log(`⚠️  No mapping found for ${park.park_code}`)
        skipped++
        continue
      }

      // Skip if name is already correct
      if (park.name === fullName) {
        skipped++
        continue
      }

      console.log(`🔧 Updating ${park.park_code}: "${park.name}" → "${fullName}"`)

      // Update the park name
      const { error: updateError } = await supabase
        .from('parks')
        .update({ name: fullName })
        .eq('id', park.id)

      if (updateError) {
        console.error(`❌ Error updating ${park.park_code}:`, updateError)
        continue
      }

      updated++
    }

    console.log('\n✅ Update complete!')
    console.log(`   Updated: ${updated} parks`)
    console.log(`   Skipped: ${skipped} parks (already correct or no mapping)`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

updateParkNames()
