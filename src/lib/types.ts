export type RestaurantStatus = 'draft' | 'live' | 'suspended';
export type SubscriptionStatus = 'active' | 'expired' | 'pending';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  slug: string;
  name: string;
  tagline: string;
  about: string;
  cuisine: string;
  phone: string;
  whatsapp?: string;
  email: string;
  facebook?: string;
  address: string;
  hours: string;
  mapEmbedUrl: string;
  heroImage?: string;
  status: RestaurantStatus;
  subscriptionStatus: SubscriptionStatus;
  theme: 'warm' | 'classic' | 'modern';
  menu: MenuCategory[];
}

export interface ClientRequest {
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  cuisine: string;
  description: string;
  preferredSlug: string;
  specialRequests?: string;
}
