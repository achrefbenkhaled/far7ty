export type InvitationTemplate = {
  id: string
  category: 'Wedding' | 'Anniversary'
  title: string
  subtitle: string
  description: string
  coupleNames: string[]
  dateLabel: string
  countdownTarget: string
  introLabel: string
  brandName: string
  navItems: Array<{ label: string; href: string }>
  storyEvents: Array<{ year: string; title: string; description: string }>
  eventCards: Array<{
    title: string
    time: string
    location: string
    address: string
    description: string
  }>
  galleryImages: Array<{ title: string; category: string }>
  giftOptions: Array<{ title: string; description: string; icon: string; link: string }>
  wishes: Array<{ name: string; message: string }>
  theme: {
    shell: string
    surface: string
    outline: string
    heading: string
    muted: string
    accent: string
    accentSoft: string
    button: string
    card: string
    badge: string
    ring: string
  }
}

export const invitationTemplates: InvitationTemplate[] = [
  {
    id: 'rose-garden',
    category: 'Wedding',
    title: 'Rose Garden',
    subtitle: 'An intimate garden soirée',
    description: 'A candlelit celebration with soft florals and golden glow.',
    coupleNames: ['Alex', 'Maria'],
    dateLabel: 'Saturday, 21 December 2024 · 6:30 PM',
    countdownTarget: '2024-12-21T18:30:00',
    introLabel: 'The Wedding of',
    brandName: 'Rose Garden',
    navItems: [
      { label: 'Our Story', href: '#story' },
      { label: 'Details', href: '#details' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'RSVP', href: '#rsvp' },
      { label: 'Wishes', href: '#gifts' },
    ],
    storyEvents: [
      { year: '2018', title: 'We Met', description: 'At a rooftop dinner under the city lights, fate made its first move.' },
      { year: '2020', title: 'First Adventure', description: 'A spontaneous road trip turned into the start of our favorite tradition.' },
      { year: '2022', title: 'The Proposal', description: 'On a moonlit hill, a promise was made and cherished forever.' },
      { year: '2024', title: 'Forever Begins', description: 'Now we gather the people who made our story feel like home.' },
    ],
    eventCards: [
      { title: 'Ceremony', time: '4:00 PM', location: 'The Garden Court', address: '44 Rose Lane, Bloomfield, CA 90210', description: 'Join us for the vows under a canopy of florals and lantern light.' },
      { title: 'Reception', time: '6:30 PM', location: 'The Ivory Hall', address: '88 Moon Avenue, Bloomfield, CA 90210', description: 'Dinner, dancing, and a night of celebration with family and friends.' },
    ],
    galleryImages: [
      { title: 'First Kiss', category: 'Memories' },
      { title: 'City Lights', category: 'Travel' },
      { title: 'The Promise', category: 'Proposal' },
      { title: 'Golden Hour', category: 'Celebration' },
      { title: 'Soft Glow', category: 'Memories' },
      { title: 'Joyful Day', category: 'Wedding' },
    ],
    giftOptions: [
      { title: 'Registry', description: 'A curated list of meaningful keepsakes.', icon: '💐', link: '#' },
      { title: 'Honeymoon', description: 'Help us create our next unforgettable memory.', icon: '✈️', link: '#' },
      { title: 'Charity', description: 'Support a cause close to our hearts.', icon: '🌿', link: '#' },
    ],
    wishes: [
      { name: 'Nora', message: 'Your love story feels like a page from a beautiful novel.' },
      { name: 'Eli', message: 'Wishing you both a lifetime of laughter and quiet joy.' },
      { name: 'Riley', message: 'The world is brighter with your love in it.' },
    ],
    theme: {
      shell: 'bg-gradient-to-br from-rose-100 via-amber-50 to-rose-50',
      surface: 'bg-white/80',
      outline: 'border-rose-200/60',
      heading: 'text-rose-900',
      muted: 'text-rose-700/70',
      accent: 'text-rose-700',
      accentSoft: 'text-amber-600',
      button: 'bg-gradient-to-r from-rose-500 to-amber-400 text-white',
      card: 'bg-white/90 shadow-[0_20px_50px_rgba(244,114,182,0.16)]',
      badge: 'bg-rose-100 text-rose-800',
      ring: 'from-rose-300 to-amber-200',
    },
  },
  {
    id: 'golden-hour',
    category: 'Wedding',
    title: 'Golden Hour',
    subtitle: 'A sun-drenched celebration',
    description: 'Across warm landscapes and glowing courts, we celebrate love.',
    coupleNames: ['Liam', 'Sophia'],
    dateLabel: 'Friday, 18 July 2025 · 5:00 PM',
    countdownTarget: '2025-07-18T17:00:00',
    introLabel: 'We Invite You To',
    brandName: 'Golden Hour',
    navItems: [
      { label: 'The Story', href: '#story' },
      { label: 'Schedule', href: '#details' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'RSVP', href: '#rsvp' },
      { label: 'Gifts', href: '#gifts' },
    ],
    storyEvents: [
      { year: '2016', title: 'A Shared Summer', description: 'Our first conversation carried the spark of a lifelong connection.' },
      { year: '2019', title: 'A Long Walk', description: 'We learned to build a life one sunrise at a time.' },
      { year: '2023', title: 'The Moment', description: 'A quiet evening and a simple question changed everything.' },
      { year: '2025', title: 'The Celebration', description: 'We are ready to welcome you into a new chapter of joy.' },
    ],
    eventCards: [
      { title: 'Ceremony', time: '5:00 PM', location: 'Saffron Terrace', address: '302 Golden Road, Monterey, CA 93940', description: 'Gather with us for a sunset ceremony framed by sea air and warm light.' },
      { title: 'Reception', time: '7:30 PM', location: 'The Lantern House', address: '12 Harbor View, Monterey, CA 93940', description: 'An evening of dinner, dancing, and candlelit conversation.' },
    ],
    galleryImages: [
      { title: 'Sunset Walk', category: 'Memories' },
      { title: 'The Beach', category: 'Travel' },
      { title: 'Warm Glow', category: 'Proposal' },
      { title: 'Golden Dinner', category: 'Celebration' },
      { title: 'Joyful Dance', category: 'Wedding' },
      { title: 'Forever', category: 'Love' },
    ],
    giftOptions: [
      { title: 'Registry', description: 'A collection of home comforts and cherished finds.', icon: '✨', link: '#' },
      { title: 'Travel Fund', description: 'Help us plan a future full of escape and wonder.', icon: '🧳', link: '#' },
      { title: 'Donation', description: 'Support our favorite community initiative.', icon: '🌅', link: '#' },
    ],
    wishes: [
      { name: 'Mina', message: 'A beautiful celebration for two beautiful people.' },
      { name: 'Kai', message: 'May your days be full of golden light and easy joy.' },
      { name: 'Ivy', message: 'I am so happy to witness this chapter begin.' },
    ],
    theme: {
      shell: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50',
      surface: 'bg-white/80',
      outline: 'border-amber-200/70',
      heading: 'text-amber-900',
      muted: 'text-amber-700/70',
      accent: 'text-amber-700',
      accentSoft: 'text-orange-600',
      button: 'bg-gradient-to-r from-amber-500 to-orange-400 text-white',
      card: 'bg-white/90 shadow-[0_20px_50px_rgba(251,191,36,0.18)]',
      badge: 'bg-amber-100 text-amber-800',
      ring: 'from-amber-300 to-orange-200',
    },
  },
  {
    id: 'velvet-bloom',
    category: 'Wedding',
    title: 'Velvet Bloom',
    subtitle: 'A romantic evening in bloom',
    description: 'Velvet textures, deep florals, and candlelit elegance.',
    coupleNames: ['Noah', 'Charlotte'],
    dateLabel: 'Saturday, 12 October 2025 · 7:00 PM',
    countdownTarget: '2025-10-12T19:00:00',
    introLabel: 'Join Us As We Celebrate',
    brandName: 'Velvet Bloom',
    navItems: [
      { label: 'Story', href: '#story' },
      { label: 'Events', href: '#details' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'RSVP', href: '#rsvp' },
      { label: 'Messages', href: '#gifts' },
    ],
    storyEvents: [
      { year: '2017', title: 'A First Hello', description: 'We met during a rainy evening and found a home in conversation.' },
      { year: '2021', title: 'Shared Dreams', description: 'Every ordinary moment became our favorite ritual.' },
      { year: '2024', title: 'A Grand Promise', description: 'The question was simple, the answer was immediate.' },
      { year: '2025', title: 'The Wedding', description: 'We are excited to mark our next chapter in the company of loved ones.' },
    ],
    eventCards: [
      { title: 'Ceremony', time: '7:00 PM', location: 'The Velvet Chapel', address: '90 Vine Street, Portland, OR 97205', description: 'A candlelit ceremony in a garden of deep roses and velvet drapes.' },
      { title: 'Reception', time: '9:00 PM', location: 'The Marigold Ballroom', address: '90 Vine Street, Portland, OR 97205', description: 'A feast, a dance floor, and a night that feels like a dream.' },
    ],
    galleryImages: [
      { title: 'Velvet Night', category: 'Evening' },
      { title: 'Blooming', category: 'Floral' },
      { title: 'Candlelight', category: 'Memories' },
      { title: 'The Dance', category: 'Celebration' },
      { title: 'Soft Roses', category: 'Wedding' },
      { title: 'Forever Lit', category: 'Love' },
    ],
    giftOptions: [
      { title: 'Registry', description: 'A collection of keepsakes and timeless gifts.', icon: '🕯️', link: '#' },
      { title: 'Dinner Fund', description: 'Support our celebration experience.', icon: '🍷', link: '#' },
      { title: 'Care Package', description: 'Help us fill our home with comfort and joy.', icon: '🛋️', link: '#' },
    ],
    wishes: [
      { name: 'Sage', message: 'The atmosphere of this celebration is nothing short of magical.' },
      { name: 'Drew', message: 'Wishing you a love that grows richer with every season.' },
      { name: 'Tess', message: 'So happy to celebrate your happiness with you.' },
    ],
    theme: {
      shell: 'bg-gradient-to-br from-fuchsia-100 via-violet-50 to-rose-50',
      surface: 'bg-white/80',
      outline: 'border-fuchsia-200/60',
      heading: 'text-fuchsia-900',
      muted: 'text-fuchsia-700/70',
      accent: 'text-fuchsia-700',
      accentSoft: 'text-violet-600',
      button: 'bg-gradient-to-r from-fuchsia-600 to-violet-500 text-white',
      card: 'bg-white/90 shadow-[0_20px_50px_rgba(217,70,239,0.16)]',
      badge: 'bg-fuchsia-100 text-fuchsia-800',
      ring: 'from-fuchsia-300 to-violet-200',
    },
  },
  {
    id: 'ocean-breeze',
    category: 'Wedding',
    title: 'Ocean Breeze',
    subtitle: 'A coastal celebration of love',
    description: 'Sea air, sunlit shores, and a breeze of fresh romance.',
    coupleNames: ['Ezra', 'Mila'],
    dateLabel: 'Sunday, 27 April 2025 · 4:00 PM',
    countdownTarget: '2025-04-27T16:00:00',
    introLabel: 'The Wedding of',
    brandName: 'Ocean Breeze',
    navItems: [
      { label: 'Our Story', href: '#story' },
      { label: 'Venue', href: '#details' },
      { label: 'Moments', href: '#gallery' },
      { label: 'RSVP', href: '#rsvp' },
      { label: 'Well Wishes', href: '#gifts' },
    ],
    storyEvents: [
      { year: '2015', title: 'A Summer Meet', description: 'We met on the shore and felt the day stretch softly around us.' },
      { year: '2020', title: 'A Home by the Sea', description: 'Shared mornings and salty air taught us what love can hold.' },
      { year: '2023', title: 'The Ask', description: 'Under an evening sky, a promise became our next adventure.' },
      { year: '2025', title: 'Forever', description: 'We are ready to celebrate with the people who mean everything to us.' },
    ],
    eventCards: [
      { title: 'Ceremony', time: '4:00 PM', location: 'The Driftwood Pier', address: '610 Shoreline Ave, Santa Barbara, CA 93101', description: 'A simple ceremony overlooking the water and the setting sun.' },
      { title: 'Reception', time: '6:30 PM', location: 'The Coral House', address: '610 Shoreline Ave, Santa Barbara, CA 93101', description: 'Dinner, music, and late-night dancing under lanterns.' },
    ],
    galleryImages: [
      { title: 'Blue Horizon', category: 'Coast' },
      { title: 'Salt Air', category: 'Travel' },
      { title: 'The Shore', category: 'Memories' },
      { title: 'Dancing at Dusk', category: 'Celebration' },
      { title: 'Open Water', category: 'Wedding' },
      { title: 'Forever Tide', category: 'Love' },
    ],
    giftOptions: [
      { title: 'Registry', description: 'Thoughtful pieces for our new home together.', icon: '🏝️', link: '#' },
      { title: 'Adventure Fund', description: 'Help us chase the horizon and create new memories.', icon: '⛵', link: '#' },
      { title: 'Charity', description: 'Support a cause that keeps our oceans bright.', icon: '🌊', link: '#' },
    ],
    wishes: [
      { name: 'Luna', message: 'Your love feels as calm and bright as the sea.' },
      { name: 'Mason', message: 'May your life be full of tides of joy and easy laughter.' },
      { name: 'Pia', message: 'So excited to celebrate this beautiful beginning.' },
    ],
    theme: {
      shell: 'bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-50',
      surface: 'bg-white/80',
      outline: 'border-sky-200/70',
      heading: 'text-sky-900',
      muted: 'text-sky-700/70',
      accent: 'text-sky-700',
      accentSoft: 'text-emerald-600',
      button: 'bg-gradient-to-r from-sky-600 to-emerald-500 text-white',
      card: 'bg-white/90 shadow-[0_20px_50px_rgba(14,165,233,0.16)]',
      badge: 'bg-sky-100 text-sky-800',
      ring: 'from-sky-300 to-emerald-200',
    },
  },
  {
    id: 'golden-jubilee',
    category: 'Anniversary',
    title: 'Golden Jubilee',
    subtitle: 'Celebrating fifty years of love',
    description: 'A luminous anniversary evening with cherished memories and family.',
    coupleNames: ['Helen', 'George'],
    dateLabel: 'Saturday, 9 November 2025 · 6:00 PM',
    countdownTarget: '2025-11-09T18:00:00',
    introLabel: 'Celebrating',
    brandName: 'Golden Jubilee',
    navItems: [
      { label: 'Our Story', href: '#story' },
      { label: 'Schedule', href: '#details' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'RSVP', href: '#rsvp' },
      { label: 'Messages', href: '#gifts' },
    ],
    storyEvents: [
      { year: '1975', title: 'The Beginning', description: 'A simple promise and a love that kept growing.' },
      { year: '1988', title: 'Family & Home', description: 'Their home became a place where love was clearly felt.' },
      { year: '2005', title: 'The Family Grows', description: 'With each new chapter, their bond only deepened.' },
      { year: '2025', title: 'Fifty Years', description: 'Now they welcome the people who have shared their journey.' },
    ],
    eventCards: [
      { title: 'Anniversary Dinner', time: '6:00 PM', location: 'The Heritage Room', address: '115 Orchard Avenue, Springfield, IL 62704', description: 'A heartfelt dinner honoring fifty years of love and friendship.' },
      { title: 'Reception', time: '8:00 PM', location: 'Rosewood Terrace', address: '115 Orchard Avenue, Springfield, IL 62704', description: 'Live music, dancing, and a night dedicated to cherished memories.' },
    ],
    galleryImages: [
      { title: 'Young Hearts', category: 'Then' },
      { title: 'Family Table', category: 'Family' },
      { title: 'Golden Memories', category: 'Forever' },
      { title: 'The Dance', category: 'Celebration' },
      { title: 'A Lifetime', category: 'Anniversary' },
      { title: 'Joyful Evening', category: 'Love' },
    ],
    giftOptions: [
      { title: 'Memory Book', description: 'A keepsake filled with messages from those who love them.', icon: '📖', link: '#' },
      { title: 'Garden Fund', description: 'Help create a space of beauty and reflection.', icon: '🌼', link: '#' },
      { title: 'Donation', description: 'Support a family cause they hold dear.', icon: '💛', link: '#' },
    ],
    wishes: [
      { name: 'Tara', message: 'What an inspiring love story to witness over so many years.' },
      { name: 'Ben', message: 'May your next years be just as full of warmth and laughter.' },
      { name: 'Clare', message: 'Thank you for showing us what enduring love looks like.' },
    ],
    theme: {
      shell: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-rose-50',
      surface: 'bg-white/80',
      outline: 'border-amber-200/60',
      heading: 'text-amber-900',
      muted: 'text-amber-700/70',
      accent: 'text-amber-700',
      accentSoft: 'text-rose-600',
      button: 'bg-gradient-to-r from-amber-500 to-rose-400 text-white',
      card: 'bg-white/90 shadow-[0_20px_50px_rgba(245,158,11,0.16)]',
      badge: 'bg-amber-100 text-amber-800',
      ring: 'from-amber-300 to-rose-200',
    },
  },
  {
    id: 'moonlight-reunion',
    category: 'Anniversary',
    title: 'Moonlight Reunion',
    subtitle: 'A timeless celebration',
    description: 'A sophisticated evening of memory, music, and moonlit joy.',
    coupleNames: ['Julian', 'Anne'],
    dateLabel: 'Friday, 14 February 2026 · 8:00 PM',
    countdownTarget: '2026-02-14T20:00:00',
    introLabel: 'Honoring',
    brandName: 'Moonlight Reunion',
    navItems: [
      { label: 'Our Story', href: '#story' },
      { label: 'Program', href: '#details' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'RSVP', href: '#rsvp' },
      { label: 'Best Wishes', href: '#gifts' },
    ],
    storyEvents: [
      { year: '1980', title: 'The First Dance', description: 'Their first dance set the rhythm for a lifetime together.' },
      { year: '1994', title: 'The Home', description: 'Their home became full of laughter, comfort, and care.' },
      { year: '2011', title: 'New Joy', description: 'Grandchildren, memories, and time spent together filled every year.' },
      { year: '2026', title: 'The Reunion', description: 'They welcome the people who shaped their beautiful story.' },
    ],
    eventCards: [
      { title: 'Cocktail Hour', time: '8:00 PM', location: 'The Moon Hall', address: '140 West Oak Street, Seattle, WA 98101', description: 'Elegant mingling, music, and a moonlit toast to enduring love.' },
      { title: 'Dinner & Dance', time: '9:30 PM', location: 'North Hall', address: '140 West Oak Street, Seattle, WA 98101', description: 'A celebratory evening with dinner, stories, and dancing.' },
    ],
    galleryImages: [
      { title: 'Quiet Courtship', category: 'Then' },
      { title: 'The Family Home', category: 'Home' },
      { title: 'Golden Party', category: 'Anniversary' },
      { title: 'Moonlit Dance', category: 'Celebration' },
      { title: 'Heartfelt Evening', category: 'Memory' },
      { title: 'Forever', category: 'Love' },
    ],
    giftOptions: [
      { title: 'Memory Box', description: 'Gather stories and photos in one treasured place.', icon: '🪞', link: '#' },
      { title: 'Garden Gift', description: 'Help us plant a place of peace and beauty.', icon: '🌙', link: '#' },
      { title: 'Donation', description: 'Support a family foundation they care deeply about.', icon: '🌟', link: '#' },
    ],
    wishes: [
      { name: 'Nadia', message: 'A beautiful reminder that love really can last a lifetime.' },
      { name: 'Owen', message: 'May your home continue to be filled with admiration and grace.' },
      { name: 'Pru', message: 'Your story is one of the most beautiful I have ever known.' },
    ],
    theme: {
      shell: 'bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-50',
      surface: 'bg-white/80',
      outline: 'border-slate-300/70',
      heading: 'text-slate-800',
      muted: 'text-slate-700/70',
      accent: 'text-slate-700',
      accentSoft: 'text-indigo-600',
      button: 'bg-gradient-to-r from-slate-700 to-indigo-500 text-white',
      card: 'bg-white/90 shadow-[0_20px_50px_rgba(71,85,105,0.16)]',
      badge: 'bg-slate-100 text-slate-700',
      ring: 'from-slate-300 to-indigo-200',
    },
  },
]
