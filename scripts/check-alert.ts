import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkAlert() {
  // Get park
  const { data: park } = await supabase
    .from('parks')
    .select('id, park_code, name')
    .eq('park_code', 'alpo')
    .single()

  console.log('Park:', park)

  // Get recent alerts
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('park_id', park!.id)
    .order('last_updated_by_nps', { ascending: false })
    .limit(5)

  console.log('\nRecent alerts:')
  alerts?.forEach(alert => {
    console.log(`  - ${alert.title}`)
    console.log(`    Is Active: ${alert.is_active}`)
    console.log(`    Fetched: ${alert.fetched_at}`)
    console.log(`    NPS Alert ID: ${alert.nps_alert_id}`)
    console.log(`    Last Updated by NPS: ${alert.last_updated_by_nps}`)
    console.log()
  })

  // Check what the NPS API currently has
  console.log('Checking NPS API...')
  const npsRes = await fetch(
    `https://developer.nps.gov/api/v1/alerts?parkCode=alpo&api_key=${process.env.NPS_API_KEY}`
  )
  const npsData = await npsRes.json() as { data: Array<{ title: string; id: string; lastIndexedDate: string }> }
  
  console.log(`\nNPS API currently has ${npsData.data.length} alerts:`)
  npsData.data.forEach((alert) => {
    console.log(`  - ${alert.title}`)
    console.log(`    NPS ID: ${alert.id}`)
    console.log(`    Last Updated: ${alert.lastIndexedDate}`)
    console.log()
  })
}

checkAlert()
