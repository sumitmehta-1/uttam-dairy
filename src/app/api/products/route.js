import { getAdminSupabase, requireAdmin } from '@/lib/server/auth';

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ products: data || [] });
  } catch (e) {
    console.error('Products fetch failed:', e);
    return Response.json({ error: e.message || 'Could not load products.' }, { status: 500 });
  }
}

export async function POST(request) {
  const { error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  try {
    const product = await request.json();
    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('products')
      .upsert([{
        id: String(product.id),
        name: String(product.name || '').slice(0, 120),
        category: String(product.category || '').slice(0, 80),
        price: Number(product.price || 0),
        mrp: Number(product.mrp || product.price || 0),
        weight: String(product.weight || '').slice(0, 40),
        image: String(product.image || '/milk.jpg').slice(0, 2000000),
        delivery_time: String(product.deliveryTime || '10 mins').slice(0, 40),
        in_stock: Boolean(product.inStock),
        description: String(product.description || '').slice(0, 500)
      }]);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Product save failed:', e);
    return Response.json({ error: e.message || 'Could not save product.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  try {
    const { productId } = await request.json();
    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error('Product delete failed:', e);
    return Response.json({ error: e.message || 'Could not delete product.' }, { status: 500 });
  }
}
