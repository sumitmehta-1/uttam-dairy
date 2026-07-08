import { getAdminSupabase, getSession, safeProfile } from '@/lib/server/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.phone) {
      return Response.json({ user: null });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', session.phone)
      .single();

    if (error || !data || data.role !== session.role) {
      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({ user: { ...safeProfile(data), loggedIn: true } });
  } catch (e) {
    console.error('Session check failed:', e);
    return Response.json({ user: null }, { status: 500 });
  }
}
