import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import parkNamesMapping from '@/park-names-mapping.json';
import parkDesignationsMapping from '@/park-designations-mapping.json';

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all parks from database
    const { data: parks, error } = await supabase
      .from('parks')
      .select('id, park_code, name, designation')
      .order('name');

    if (error) throw error;

    let updated = 0;
    const errors: string[] = [];

    // Update each park with name and designation from mappings
    for (const park of parks || []) {
      const mappedName = parkNamesMapping[park.park_code as keyof typeof parkNamesMapping];
      const mappedDesignation = parkDesignationsMapping[park.park_code as keyof typeof parkDesignationsMapping];
      
      // Only update if we have mapped data and it's different
      if (mappedName || mappedDesignation) {
        const updates: any = {};
        if (mappedName && mappedName !== park.name) {
          updates.name = mappedName;
        }
        if (mappedDesignation && mappedDesignation !== park.designation) {
          updates.designation = mappedDesignation;
        }
        
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('parks')
            .update(updates)
            .eq('id', park.id);
          
          if (updateError) {
            errors.push(`Failed to update ${park.park_code}: ${updateError.message}`);
          } else {
            updated++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      total: parks?.length || 0,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Synced ${updated} parks successfully` 
    });
  } catch (err) {
    console.error('Error syncing park names:', err);
    return NextResponse.json(
      { error: 'Failed to sync park names' },
      { status: 500 }
    );
  }
}
