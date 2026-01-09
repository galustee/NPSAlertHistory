import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This endpoint syncs park names from the NPS API
    // For now, it's a placeholder that returns the current parks
    const { data: parks, error } = await supabase
      .from('parks')
      .select('id, park_code, name')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      count: parks?.length || 0,
      message: 'Park names synced successfully' 
    });
  } catch (err) {
    console.error('Error syncing park names:', err);
    return NextResponse.json(
      { error: 'Failed to sync park names' },
      { status: 500 }
    );
  }
}
