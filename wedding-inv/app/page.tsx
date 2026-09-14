import WeddingInvitation from '@/components/wedding-invitation';

export default function Home() {
  const sampleInvitation = {
    brideName: 'Emma',
    groomName: 'James',
    brideImage:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    groomImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
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
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=500&fit=crop',
    ],
    countdownEnabled: true,
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    colors: {
      primary: '#f5f3f0',
      secondary: '#e8e4df',
      accent: '#c99a5b',
    },
  };

  return <WeddingInvitation invitation={sampleInvitation} />;
}
