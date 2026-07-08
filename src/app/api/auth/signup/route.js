import { getAdminSupabase, safeProfile, setSessionCookie } from '@/lib/server/auth';

export async function POST(request) {
  try {
    const { name, phone, password, address } = await request.json();
    const cleanName = String(name || '').trim();
    const cleanAddress = String(address || '').trim();

    if (!cleanName || !cleanAddress || !/^[6-9]\d{9}$/.test(phone || '') || String(password || '').length < 6) {
      return Response.json({ error: 'Please provide valid signup details.' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data: existing } = await supabase
      .from('profiles')
      .select('phone')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: 'Mobile number already registered.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ phone, password, name: cleanName, address: cleanAddress, role: 'user' }])
      .select('*')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    await setSessionCookie(data);
    return Response.json({ user: { ...safeProfile(data), loggedIn: true } });
  } catch (e) {
    console.error('Signup failed:', e);
    return Response.json({ error: e.message || 'Signup failed.' }, { status: 500 });
  }
}
