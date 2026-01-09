import { createClient } from '@supabase/supabase-js'
import parkNameMapping from '../park-names-mapping.json'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkMapping() {
  console.log('🔍 Checking park name mapping coverage...\n')

  const { data: parks } = await supabase
    .from('parks')
    .select('park_code, name')
    .order('park_code')

  const mapping = parkNameMapping as Record<string, string>
  const codesAsNames = parks?.filter(p => p.name === p.park_code) || []
  const missingFromMapping = parks?.filter(p => !mapping[p.park_code]) || []

  console.log(`📊 Total parks in database: ${parks?.length || 0}`)
  console.log(`📋 Total parks in mapping: ${Object.keys(mapping).length}`)
  
  if (codesAsNames.length > 0) {
    console.log(`\n⚠️  Parks with code as name (${codesAsNames.length}):`)
    codesAsNames.forEach(p => console.log(`   - ${p.park_code}`))
  } else {
    console.log('\n✅ All parks have proper names!')
  }

  if (missingFromMapping.length > 0) {
    console.log(`\n⚠️  Parks not in mapping file (${missingFromMapping.length}):`)
    missingFromMapping.forEach(p => console.log(`   - ${p.park_code}: ${p.name}`))
  } else {
    console.log('\n✅ All database parks are in the mapping!')
  }
}

checkMapping()
