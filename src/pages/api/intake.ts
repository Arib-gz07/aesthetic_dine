import type { APIRoute } from 'astro';
import { getServiceSupabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const payload = {
      restaurant_name: body.restaurantName,
      owner_name: body.ownerName,
      phone: body.phone,
      email: body.email,
      cuisine: body.cuisine,
      preferred_slug: body.preferredSlug,
      description: body.description,
      plan: body.plan || 'starter',
      special_requests: body.specialRequests || null,
      status: 'new',
    };

    const supabase = getServiceSupabase();

    if (supabase) {
      const { error } = await supabase.from('client_requests').insert(payload);
      if (error) {
        console.error('Supabase insert error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save your request.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      console.log('Intake request (demo mode — Supabase not configured):', payload);
    }

    return new Response(
      JSON.stringify({
        message: 'Thank you! We received your request and will contact you within 1–2 business days.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
