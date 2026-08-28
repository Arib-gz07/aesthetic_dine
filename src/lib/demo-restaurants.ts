import type { Restaurant } from './types';

export const demoRestaurants: Record<string, Restaurant> = {
  demo: {
    slug: 'demo',
    name: 'Demo Kitchen',
    tagline: 'Authentic flavors, crafted with care',
    about:
      'Demo Kitchen is a sample restaurant site built by Aesthetic Dine. Replace this content with your own story, photos, and menu when you sign up.',
    cuisine: 'Bangladeshi & Continental',
    phone: '+880 1XXX-XXXXXX',
    whatsapp: '+8801XXXXXXXXX',
    email: 'hello@demokitchen.bd',
    address: '123 Food Street, Dhaka 1205, Bangladesh',
    hours: 'Sat–Thu: 11:00 AM – 11:00 PM\nFri: 2:00 PM – 11:00 PM',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.038094787!2d90.391!3d23.810!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ4JzM2LjAiTiA5MMKwMjMnMjcuNiJF!5e0!3m2!1sen!2sbd!4v1',
    status: 'live',
    subscriptionStatus: 'active',
    theme: 'warm',
    menu: [
      {
        id: 'starters',
        name: 'Starters',
        items: [
          {
            id: 's1',
            name: 'Chicken Tikka',
            description: 'Marinated grilled chicken with mint chutney',
            price: 320,
            isAvailable: true,
          },
          {
            id: 's2',
            name: 'Vegetable Spring Roll',
            description: 'Crispy rolls with seasonal vegetables',
            price: 180,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'mains',
        name: 'Main Course',
        items: [
          {
            id: 'm1',
            name: 'Beef Kacchi Biriyani',
            description: 'Slow-cooked beef biriyani served with borhani',
            price: 450,
            isAvailable: true,
          },
          {
            id: 'm2',
            name: 'Grilled Pomfret',
            description: 'Whole fish grilled with herbs and lemon butter',
            price: 680,
            isAvailable: true,
          },
        ],
      },
      {
        id: 'drinks',
        name: 'Drinks',
        items: [
          {
            id: 'd1',
            name: 'Fresh Lime Soda',
            description: 'House-made lime soda with mint',
            price: 120,
            isAvailable: true,
          },
          {
            id: 'd2',
            name: 'Mango Lassi',
            description: 'Thick yogurt drink with seasonal mango',
            price: 150,
            isAvailable: true,
          },
        ],
      },
    ],
  },
};
