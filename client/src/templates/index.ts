import type { ComponentType } from 'react';

import TwainLoveWeddingTemplate from './TwainLoveWeddingTemplate';
import EmmaJamesWeddingTemplate from './EmmaJamesWeddingTemplate';
import GoldenGlowTemplate from './GoldenGlowTemplate';
import ModernBloomTemplate from './ModernBloomTemplate';
import CorporateLuxeTemplate from './CorporateLuxeTemplate';
import MidnightGalaTemplate from './MidnightGalaTemplate';
import MagicBirthdayTemplate from './MagicBirthdayTemplate';

export interface TemplateComponentProps {
  variant?: string;
  preview?: boolean;
  invitationData?: Record<string, unknown>;
}

export {
  TwainLoveWeddingTemplate,
  EmmaJamesWeddingTemplate,
  GoldenGlowTemplate,
  ModernBloomTemplate,
  CorporateLuxeTemplate,
  MidnightGalaTemplate,
  MagicBirthdayTemplate,
};

export const templateMap: Record<string, ComponentType<TemplateComponentProps>> = {
  'magic-birthday': MagicBirthdayTemplate,
  'twain-love-wedding': TwainLoveWeddingTemplate,
  'wedding-inv': EmmaJamesWeddingTemplate,
  'golden-glow': GoldenGlowTemplate,
  'modern-bloom': ModernBloomTemplate,
  'corporate-luxe': CorporateLuxeTemplate,
  'midnight-gala': MidnightGalaTemplate,
};

export function getTemplateComponent(templateId: string): ComponentType<TemplateComponentProps> {
  return templateMap[templateId] || TwainLoveWeddingTemplate;
}
