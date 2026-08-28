import type { APIRoute } from 'astro';
import { getServiceSupabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const slug = body.restaurantSlug;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing restaurant.' }), { status: 400 });
    }

    const payload = {
      restaurant_slug: slug,
      customer_name: body.name,
      phone: body.phone,
      date: body.date,
      guests: body.guests,
      message: body.message || null,
    };

    const supabase = getServiceSupabase();

    if (supabase) {
      const { error } = await supabase.from('reservations').insert(payload);
      if (error) {
        console.error('Reservation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to submit reservation.' }), { status: 500 });
      }
    } else {
      console.log('Reservation (demo mode):', payload);
    }

    return new Response(JSON.stringify({ message: 'Reservation received! We will confirm shortly.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), { status: 400 });
  }
};
