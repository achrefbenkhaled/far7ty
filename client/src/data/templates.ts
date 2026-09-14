
export type WeddingInvitationData = {
  brideName: string;
  groomName: string;
  brideImage: string;
  groomImage: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  story: string;
  gallery: string[];
  countdownEnabled: boolean;
  musicUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

export type Template = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  image: string;
  category: string;
  description: string;
  invitation?: WeddingInvitationData;
};

export type InvitationStoryEvent = {
  year: string;
  title: string;
  description: string;
};

export type InvitationEventCard = {
  date: string;
  title: string;
  time: string;
  location: string;
  address: string;
  description: string;
  mapQuery?: string;
};

export type InvitationGalleryItem = {
  title: string;
  category: string;
};

export type InvitationGiftOption = {
  title: string;
  description: string;
  icon: string;
};

export type InvitationWish = {
  name: string;
  message: string;
};

export type InvitationContent = {
  coupleNames: [string, string];
  introLabel: string;
  subtitle: string;
  dateLabel: string;
  description: string;
  showStoryTimeline?: boolean;
  pageBackground: string;
  envelopeTop: string;
  envelopeMiddle: string;
  envelopeBottom: string;
  envelopeBorder: string;
  envelopeTextPrimary: string;
  envelopeTextSecondary: string;
  envelopeLabelText: string;
  accentColor: string;
  storyEvents: InvitationStoryEvent[];
  eventCards: InvitationEventCard[];
  galleryItems: InvitationGalleryItem[];
  giftOptions: InvitationGiftOption[];
  wishes: InvitationWish[];
};

export const defaultInvitationContent: InvitationContent = {
  coupleNames: ['Alexandra', 'Michael'],
  introLabel: 'YOU ARE INVITED',
  subtitle: 'Together we are more',
  dateLabel: 'Saturday, 21 December 2024 · 6:30 PM',
  description: 'We cordially invite you to join us as we celebrate the beginning of our forever. Be part of our special day as we exchange vows and start our new chapter together.',
  pageBackground: '#fffaf7',
  envelopeTop: '#fefcf8',
  envelopeMiddle: '#fdf1e8',
  envelopeBottom: '#f7d9d5',
  envelopeBorder: '#e5c29a',
  envelopeTextPrimary: '#7a4b42',
  envelopeTextSecondary: '#8d6437',
  envelopeLabelText: '#9a6f4f',
  accentColor: '#fbbf24',
  storyEvents: [
    { year: '2018', title: 'We Met', description: 'At a rooftop dinner under the city lights, fate made its first move.' },
    { year: '2020', title: 'First Adventure', description: 'A spontaneous road trip turned into the start of our favorite tradition.' },
    { year: '2022', title: 'The Proposal', description: 'On a moonlit hill, a promise was made and cherished forever.' },
    { year: '2024', title: 'Forever Begins', description: 'Now we gather the people who made our story feel like home.' }
  ],
  eventCards: [
    { date: '2024-12-20', title: 'Welcome Dinner', time: '7:00 PM', location: 'The Garden Terrace', address: 'Villa Ephrussi de Rothschild, 1 Avenue Ephrussi, 06230 Saint-Jean-Cap-Ferrat, France', description: 'A warm welcome dinner for our closest family and friends overlooking the sea.', mapQuery: 'Villa Ephrussi de Rothschild, Saint-Jean-Cap-Ferrat, France' },
    { date: '2024-12-21', title: 'Ceremony', time: '4:00 PM', location: 'The Grand Ballroom', address: 'Château de Chantilly, 60500 Chantilly, France', description: 'Join us as we exchange vows and begin our forever together.', mapQuery: 'Château de Chantilly, France' },
    { date: '2024-12-22', title: 'Farewell Brunch', time: '10:00 AM', location: 'The Sunset Cafe', address: 'Plage de la Mala, 06320 Cap-d\'Ail, French Riviera', description: 'A relaxed brunch by the azure waters to share one last joyful moment.', mapQuery: 'Plage de la Mala, Cap-d\'Ail, France' }
  ],
  galleryItems: [
    { title: 'First Meeting', category: 'Memory' },
    { title: 'Travel Adventures', category: 'Adventure' },
    { title: 'The Proposal', category: 'Special' }
  ],
  giftOptions: [
    { title: 'Registry', description: 'Browse our curated wedding registry', icon: '🎁' },
    { title: 'Honeymoon Fund', description: 'Help us create unforgettable memories', icon: '✈️' },
    { title: 'Charity Donation', description: 'In lieu of gifts, support our favorite cause', icon: '💝' }
  ],
  wishes: [
    { name: 'Jamie', message: 'Your love story is beautifully inspiring.' },
    { name: 'Rae', message: 'Wishing you endless laughter and a lifetime of joy.' }
  ]
};

export const categories = ['Wedding', 'Birthday', 'Party', 'Graduation', 'Custom'];

export const templates: Template[] = [
  {
    id: 'magic-birthday',
    title: 'Magie d’Anniversaire',
    subtitle: 'Une révélation cinématographique et interactive pour un anniversaire inoubliable.',
    accent: 'from-amber-500/25 via-yellow-500/20 to-black',
    image: '/templates/magic-birthday.png',
    category: 'Birthday',
    description: 'Une expérience d’anniversaire haut de gamme avec ouverture magique, compte à rebours en temps réel, bougie à vœu interactive, récit photo et confirmation RSVP fluide.'
  },
  {
    id: 'twain-love-wedding',
    title: 'Twain Love Wedding',
    subtitle: 'First template from wedinf temp 1',
    accent: 'from-pink-500/20 via-fuchsia-500/20 to-slate-900',
    image: '/templates/twain-love.png',
    category: 'Wedding',
    description: 'A romantic wedding invitation experience with elegant typography, love story moments, and RSVP details.'
  },
  {
    id: 'wedding-inv',
    title: 'Emma & James Wedding',
    subtitle: 'A beautifully animated wedding invitation with story, gallery, countdown, and RSVP.',
    accent: 'from-pink-500/20 via-amber-500/20 to-slate-900',
    image: '/templates/emma-james.png',
    category: 'Wedding',
    description: 'A fully integrated wedding invitation page with slideshow gallery and animated countdown.',
    invitation: {
      brideName: 'Emma',
      groomName: 'James',
      brideImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      groomImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      weddingDate: '2025-06-21',
      weddingTime: '4:00 PM',
      venueName: 'The Grand Ballroom',
      venueAddress: '123 Elegant Street, Wedding City, WC 12345',
      mapsUrl: 'https://maps.google.com/?q=wedding+venue',
      story:
        'We met on a cold winter evening at a coffee shop, where Emma was working on her thesis and James ordered his usual cappuccino. After striking up a conversation that lasted until closing time, we realized we had found something special. From midnight drives to watching sunrises, every moment has been a beautiful adventure. Now, surrounded by our loved ones, we are ready to start the next chapter of our story.',
      gallery: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=500&fit=crop',
      ],
      countdownEnabled: true,
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      colors: {
        primary: '#8B5E3C',
        secondary: '#D4A574',
        accent: '#C06060',
      },
    }
  },
  {
    id: 'golden-glow',
    title: 'Golden Glow',
    subtitle: 'Elegant warm tones with RSVP and countdown blocks.',
    accent: 'from-amber-500/20 via-rose-500/20 to-slate-900',
    image: '/templates/golden-glow.png',
    category: 'Wedding',
    description: 'A polished golden invitation layout for classic celebrations.'
  },
  {
    id: 'modern-bloom',
    title: 'Modern Bloom',
    subtitle: 'Bright playful design with social handles and event details.',
    accent: 'from-emerald-500/20 via-cyan-500/20 to-slate-900',
    image: '/templates/modern-bloom.png',
    category: 'Birthday',
    description: 'A joyful, modern invitation layout for birthdays and personal events.'
  },
  {
    id: 'corporate-luxe',
    title: 'Corporate Luxe',
    subtitle: 'Prestigious Black, White & Gold celebration for graduation excellence and honors.',
    accent: 'from-amber-500/20 via-yellow-500/20 to-black',
    image: '/templates/corporate-luxe.png',
    category: 'Graduation',
    description: 'An elite Black, White & Gold invitation layout for prestigious graduation ceremonies and gala celebrations.'
  },
  {
    id: 'midnight-gala',
    title: 'Midnight Gala',
    subtitle: 'Luxury-inspired invitation experience for evening events.',
    accent: 'from-slate-500/20 via-fuchsia-500/20 to-slate-900',
    image: '/templates/midnight-gala.png',
    category: 'Conference',
    description: 'A glamorous invitation experience for evening galas and upscale celebrations.'
  }
];
