// Script to generate park-designations-mapping.json
// Run this once to create the mapping file

const NPS_API_KEY = process.env.NPS_API_KEY!

interface NPSPark {
  parkCode: string
  designation: string
}

interface NPSParksResponse {
  data: NPSPark[]
  total: string
}

async function generateDesignationMapping() {
  console.log('🔍 Fetching all parks from NPS API...\n')

  const allParks: NPSPark[] = []
  let start = 0
  const limit = 50

  while (true) {
    const response = await fetch(
      `https://developer.nps.gov/api/v1/parks?limit=${limit}&start=${start}&api_key=${NPS_API_KEY}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      throw new Error(`NPS API error: ${response.status}`)
    }

    const data: NPSParksResponse = await response.json()
    allParks.push(...data.data)

    console.log(`  Fetched ${allParks.length} parks...`)

    const total = parseInt(data.total || '0')
    start += limit

    if (start >= total) break
  }

  console.log(`\n✅ Fetched ${allParks.length} total parks\n`)

  // Create mapping object
  const mapping: Record<string, string> = {}
  for (const park of allParks) {
    if (park.parkCode && park.designation) {
      mapping[park.parkCode] = park.designation
    }
  }

  // Output as JSON
  console.log('📝 Designation mapping:\n')
  console.log(JSON.stringify(mapping, null, 2))
  
  console.log(`\n✅ Created mapping for ${Object.keys(mapping).length} parks`)
  console.log('\n💡 Copy the output above and save it to: park-designations-mapping.json')
}

generateDesignationMapping()
