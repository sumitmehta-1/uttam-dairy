import { getAdminSupabase, safeProfile, setSessionCookie } from '@/lib/server/auth';

export async function POST(request) {
  try {
    const { phone, password } = await request.json();
    if (!/^[6-9]\d{9}$/.test(phone || '') || !password) {
      return Response.json({ error: 'Invalid phone or password.' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !data || data.password !== password) {
      return Response.json({ error: 'Incorrect phone or password.' }, { status: 401 });
    }

    await setSessionCookie(data);
    return Response.json({ user: { ...safeProfile(data), loggedIn: true } });
  } catch (e) {
    console.error('Login failed:', e);
    return Response.json({ error: e.message || 'Login failed.' }, { status: 500 });
  }
}
