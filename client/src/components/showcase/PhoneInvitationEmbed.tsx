import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { PhoneFrame } from './PhoneFrame';
import type { TemplateComponentProps } from '../../templates';

const loaders: Record<string, () => Promise<{ default: React.ComponentType<TemplateComponentProps> }>> = {
  'magic-birthday': () => import('../../templates/MagicBirthdayTemplate'),
  'twain-love-wedding': () => import('../../templates/TwainLoveWeddingTemplate'),
  'wedding-inv': () => import('../../templates/EmmaJamesWeddingTemplate'),
  'golden-glow': () => import('../../templates/GoldenGlowTemplate'),
  'modern-bloom': () => import('../../templates/ModernBloomTemplate'),
  'corporate-luxe': () => import('../../templates/CorporateLuxeTemplate'),
  'midnight-gala': () => import('../../templates/MidnightGalaTemplate'),
};

interface PhoneInvitationEmbedProps {
  templateId: string;
}

function InvitationSkeleton() {
  return (
    <div className="flex h-[560px] items-center justify-center bg-[#faf8f5] text-xs uppercase tracking-[0.25em] text-[#5c4a3d]">
      Invly
    </div>
  );
}

export function PhoneInvitationEmbed({ templateId }: PhoneInvitationEmbedProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const loader = loaders[templateId] || loaders['twain-love-wedding'];
  const Template = lazy(loader);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: '120px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef}>
      <PhoneFrame>
        {visible ? (
          <Suspense fallback={<InvitationSkeleton />}>
            <div className="origin-top scale-[0.82]">
              <Template variant="embed" preview />
            </div>
          </Suspense>
        ) : (
          <InvitationSkeleton />
        )}
      </PhoneFrame>
    </div>
  );
}
