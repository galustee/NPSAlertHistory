import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: parks, error } = await supabase
      .from('parks')
      .select('id, park_code, name, created_at')
      .order('name')

    if (error) throw error

    return Response.json(parks)
  } catch (err) {
    console.error('Error fetching parks:', err)
    return Response.json(
      { error: 'Failed to fetch parks' },
      { status: 500 }
    )
  }
}
