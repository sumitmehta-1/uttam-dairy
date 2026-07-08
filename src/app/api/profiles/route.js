import { getAdminSupabase, requireAdmin, safeProfile } from '@/lib/server/auth';

export async function GET() {
  const { error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ profiles: (data || []).map(safeProfile) });
  } catch (e) {
    console.error('Profiles fetch failed:', e);
    return Response.json({ error: e.message || 'Could not load users.' }, { status: 500 });
  }
}
