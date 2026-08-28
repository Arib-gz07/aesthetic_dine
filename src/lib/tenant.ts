import { demoRestaurants } from './demo-restaurants';
import { getSupabase } from './supabase';
import type { Restaurant } from './types';

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, menu_categories(*, menu_items(*))')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return mapDbRestaurant(data);
    }
  }

  return demoRestaurants[slug] ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRestaurant(data: any): Restaurant {
  return {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline ?? '',
    about: data.about ?? '',
    cuisine: data.cuisine ?? '',
    phone: data.phone ?? '',
    whatsapp: data.whatsapp ?? undefined,
    email: data.email ?? '',
    facebook: data.facebook ?? undefined,
    address: data.address ?? '',
    hours: data.hours ?? '',
    mapEmbedUrl: data.map_embed_url ?? '',
    heroImage: data.hero_image ?? undefined,
    status: data.status,
    subscriptionStatus: data.subscription_status,
    theme: data.theme ?? 'warm',
    menu: (data.menu_categories ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat: any) => ({
        id: cat.id,
        name: cat.name,
        items: (cat.menu_items ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description ?? '',
            price: item.price,
            isAvailable: item.is_available,
          }),
        ),
      }),
    ),
  };
}

export function isRestaurantVisible(restaurant: Restaurant): boolean {
  return restaurant.status === 'live' && restaurant.subscriptionStatus === 'active';
}
