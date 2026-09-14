export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '0000000000';
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com';
export const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL || 'https://facebook.com';

export function buildWhatsAppUrl(message: string) {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, '');
  const text = encodeURIComponent(message);
  if (!digits || digits === '0000000000') {
    return `https://wa.me/?text=${text}`;
  }
  return `https://wa.me/${digits}?text=${text}`;
}

export function orderWhatsAppMessage(templateName: string, details?: {
  name?: string;
  phone?: string;
  date?: string;
  message?: string;
}) {
  const lines = [`Bonjour Invly, je suis intéressé(e) par le modèle ${templateName}.`];
  if (details?.name) lines.push(`Nom: ${details.name}`);
  if (details?.phone) lines.push(`Téléphone: ${details.phone}`);
  if (details?.date) lines.push(`Date du mariage: ${details.date}`);
  if (details?.message) lines.push(`Message: ${details.message}`);
  return lines.join('\n');
}
