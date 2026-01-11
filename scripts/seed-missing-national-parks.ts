import { supabase } from '../lib/supabase';
import parkNamesMapping from '../park-names-mapping.json';
import parkDesignationsMapping from '../park-designations-mapping.json';

// The 10 National Parks that have never had alerts in the NPS API
const missingNationalParkCodes = [
  'acad',  // Acadia
  'npsa',  // American Samoa
  'arch',  // Arches
  'gaar',  // Gates of the Arctic
  'glba',  // Glacier Bay
  'hosp',  // Hot Springs
  'katm',  // Katmai
  'kova',  // Kobuk Valley
  'romo',  // Rocky Mountain
  'jeff',  // Gateway Arch
];

async function seedMissingNationalParks() {
  console.log('Seeding missing National Parks...\n');
  
  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const code of missingNationalParkCodes) {
    const name = parkNamesMapping[code as keyof typeof parkNamesMapping];
    const designation = parkDesignationsMapping[code as keyof typeof parkDesignationsMapping];

    if (!name) {
      errors.push(`Missing name mapping for ${code}`);
      continue;
    }

    if (!designation) {
      errors.push(`Missing designation mapping for ${code}`);
      continue;
    }

    // Check if park already exists
    const { data: existing } = await supabase
      .from('parks')
      .select('id')
      .eq('park_code', code)
      .single();

    if (existing) {
      console.log(`⏭️  ${code}: Already exists, skipping`);
      skipped++;
      continue;
    }

    // Insert the park
    const { error } = await supabase
      .from('parks')
      .insert({
        park_code: code,
        name: name,
        designation: designation,
      });

    if (error) {
      errors.push(`Failed to insert ${code}: ${error.message}`);
      console.log(`❌ ${code}: ${error.message}`);
    } else {
      console.log(`✅ ${code}: ${name} (${designation})`);
      inserted++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
}

seedMissingNationalParks()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
