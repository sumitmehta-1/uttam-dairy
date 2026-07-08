import { getAdminSupabase, requireSession } from '@/lib/server/auth';

const MAX_ORDER_TOTAL = 1000;
const ALLOWED_STATUSES = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'];

export async function GET() {
  const { session, error: sessionError } = await requireSession();
  if (sessionError) return sessionError;

  try {
    const supabase = getAdminSupabase();
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (session.role !== 'admin' && session.role !== 'delivery') {
      query = query.eq('phone', session.phone);
    }

    const { data, error } = await query;
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ orders: data || [] });
  } catch (e) {
    console.error('Order fetch failed:', e);
    return Response.json({ error: e.message || 'Could not load orders.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, error: sessionError } = await requireSession();
  if (sessionError) return sessionError;

  try {
    const order = await request.json();
    const total = Number(order.total);

    if (!Number.isFinite(total) || total > MAX_ORDER_TOTAL) {
      return Response.json({ error: `Order total cannot exceed Rs ${MAX_ORDER_TOTAL}.` }, { status: 400 });
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      return Response.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    const safeOrder = {
      id: String(order.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`),
      timestamp: Number(order.timestamp || Date.now()),
      items: order.items,
      subtotal: Number(order.subtotal || 0),
      delivery_fee: Number(order.deliveryFee || 0),
      handling_fee: Number(order.handlingFee || 0),
      total,
      payment_method: order.paymentMethod === 'upi' ? 'upi' : 'cod',
      address: String(order.address || '').slice(0, 500),
      phone: session.phone,
      name: String(session.name || order.name || '').slice(0, 100),
      status: 'Pending'
    };

    const supabase = getAdminSupabase();
    const { error } = await supabase.from('orders').insert([safeOrder]);
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, order: safeOrder });
  } catch (e) {
    console.error('Order save failed:', e);
    return Response.json({ error: e.message || 'Could not save order.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { session, error: sessionError } = await requireSession();
  if (sessionError) return sessionError;
  if (session.role !== 'admin' && session.role !== 'delivery') {
    return Response.json({ error: 'Admin or delivery access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const orderId = String(body.orderId || '');
    if (!orderId) {
      return Response.json({ error: 'Order id is required.' }, { status: 400 });
    }

    const updates = {};
    if (body.status) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return Response.json({ error: 'Invalid order status.' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (Array.isArray(body.items)) {
      updates.items = body.items;
      updates.subtotal = Number(body.subtotal || 0);
      updates.delivery_fee = Number(body.deliveryFee || 0);
      updates.handling_fee = Number(body.handlingFee || 0);
      updates.total = Number(body.total || 0);
      if (updates.total > MAX_ORDER_TOTAL) {
        return Response.json({ error: `Order total cannot exceed Rs ${MAX_ORDER_TOTAL}.` }, { status: 400 });
      }
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Order update failed:', e);
    return Response.json({ error: e.message || 'Could not update order.' }, { status: 500 });
  }
}
