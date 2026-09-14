import { z } from 'zod';

export type EventType = 'wedding' | 'birthday' | 'graduation' | 'business' | 'gala' | 'custom';
export type LanguageCode = 'fr' | 'en' | 'ar';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'time'
  | 'select'
  | 'repeatable-list'
  | 'image'
  | 'language'
  | 'url';

export interface BaseFieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  section?: 'main' | 'venue' | 'schedule' | 'wishes' | 'story' | 'gallery' | 'rsvp' | 'extra';
  visibleWhen?: {
    field: string;
    equals?: string | number | boolean;
  };
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: Array<{ label: string; value: string }>;
}

export interface RepeatableListFieldConfig extends BaseFieldConfig {
  type: 'repeatable-list';
  itemFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'date' | 'time' | 'textarea';
    required?: boolean;
    placeholder?: string;
  }>;
}

export interface EventFieldConfig {
  fields: Array<BaseFieldConfig | SelectFieldConfig | RepeatableListFieldConfig>;
  defaults?: Record<string, unknown>;
}

export type EventSchemaMap = Record<EventType, EventFieldConfig>;

export const defaultLanguage: LanguageCode = 'fr';

export const googleMapsUrlSchema = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return host.includes('google.com') || host.includes('maps.google.com') || host.includes('goo.gl') || host.includes('maps.app.goo.gl');
  } catch {
    return true; // allow custom location text/links as well
  }
}, 'Must be a valid location URL');

export const eventFieldSchemas: EventSchemaMap = {
  wedding: {
    defaults: {
      language: defaultLanguage,
      brideName: '',
      groomName: '',
      date: '',
      time: '',
      dayName: '',
      dayNumber: '',
      yearNumber: '',
      venue: '',
      address: '',
      mapsUrl: '',
      description: '',
      whatsappPhone: '',
      program: [
        { time: '18:00', title: 'Accueil des invités', description: 'Arrivée des invités et rafraîchissements' },
        { time: '20:00', title: 'Cérémonie & Échange des alliances', description: 'Entrée des mariés et célébration' },
        { time: '21:30', title: 'Dîner & Soirée dansante', description: 'Buffet gastronomique et festivités' },
      ],
      wishes: [
        { name: 'Famille & Proches', message: 'Tous nos vœux de bonheur et d’amour infini pour votre union ! ✨💍' },
      ],
      storyEvents: [
        { year: '2020', title: 'Notre rencontre', description: 'Le début d’une belle aventure partagée.' },
        { year: '2023', title: 'La demande', description: 'Un moment inoubliable sous les étoiles.' },
      ],
      gallery: [],
    },
    fields: [
      { key: 'brideName', label: 'Bride Name (اسم العروس)', type: 'text', required: true, placeholder: 'Emma / سالي', section: 'main' },
      { key: 'groomName', label: 'Groom Name (اسم العريس)', type: 'text', required: true, placeholder: 'James / أيمن', section: 'main' },
      { key: 'date', label: 'Wedding Date', type: 'date', required: true, section: 'main' },
      { key: 'time', label: 'Wedding Time', type: 'text', placeholder: '18:00 / 06 مساءً / 4:00 PM', section: 'main' },
      { key: 'dayName', label: 'Day Name (e.g. يوم الأحد / Samedi)', type: 'text', placeholder: 'يوم الأحد / Samedi', section: 'main' },
      { key: 'dayNumber', label: 'Day Number (e.g. 24)', type: 'text', placeholder: '24', section: 'main' },
      { key: 'yearNumber', label: 'Year Number (e.g. 2028)', type: 'text', placeholder: '2028', section: 'main' },
      { key: 'venue', label: 'Venue Name (اسم القاعة)', type: 'text', required: true, placeholder: 'Le Grand Palais / قصر الأفراح الملكي', section: 'venue' },
      { key: 'address', label: 'Venue Address (العنوان)', type: 'text', placeholder: '123 Avenue des Roses / شارع النرجس', section: 'venue' },
      { key: 'mapsUrl', label: 'Google Maps Link', type: 'url', placeholder: 'https://maps.google.com/?q=...', section: 'venue' },
      { key: 'description', label: 'Invitation Verse / Story / Message', type: 'textarea', placeholder: 'لفرحنا اليوم ندعوكم، بالطيب والورد نلاقيكم...', section: 'main' },
      { key: 'language', label: 'Language', type: 'select', required: true, section: 'main', options: [
        { label: 'French (Français)', value: 'fr' },
        { label: 'Arabic (العربية)', value: 'ar' },
        { label: 'English', value: 'en' },
      ] },
      { key: 'whatsappPhone', label: 'WhatsApp RSVP Number', type: 'text', placeholder: '+33600000000', helperText: 'Guests will click WhatsApp button to send their RSVP confirmation directly to this number.', section: 'rsvp' },
      {
        key: 'program',
        label: 'Programme & Schedule (Events)',
        type: 'repeatable-list',
        section: 'schedule',
        itemFields: [
          { key: 'time', label: 'Time (الوقت)', type: 'text', required: true, placeholder: '18:00 / 06:00 م' },
          { key: 'title', label: 'Event Title (عنوان الفقرة)', type: 'text', required: true, placeholder: 'Cérémonie / استقبال الضيوف' },
          { key: 'description', label: 'Description (التفاصيل)', type: 'textarea', placeholder: 'Détails de la cérémonie / ترحيب بالأهل' },
          { key: 'location', label: 'Location (اختياري)', type: 'text', placeholder: 'Salle principale' },
        ],
      },
      {
        key: 'wishes',
        label: 'Pre-filled Wishes & Guestbook Messages (التهاني والتبريكات)',
        type: 'repeatable-list',
        section: 'wishes',
        itemFields: [
          { key: 'name', label: 'Guest Name (اسم المهنئ)', type: 'text', required: true, placeholder: 'Sophie / عائلة العريس' },
          { key: 'message', label: 'Message (رسالة التهنئة)', type: 'textarea', required: true, placeholder: 'Félicitations aux mariés ! / ألف مبروك' },
        ],
      },
      {
        key: 'storyEvents',
        label: 'Love Story Timeline Milestones (قصتنا)',
        type: 'repeatable-list',
        section: 'story',
        itemFields: [
          { key: 'year', label: 'Year / Date (السنة أو التاريخ)', type: 'text', required: true, placeholder: '2022' },
          { key: 'title', label: 'Milestone Title (العنوان)', type: 'text', required: true, placeholder: 'Notre rencontre / بداية القصة' },
          { key: 'description', label: 'Description (الوصف)', type: 'textarea', placeholder: 'Une belle soirée d’hiver...' },
        ],
      },
      { key: 'gallery', label: 'Gallery Images', type: 'image', section: 'gallery', helperText: 'Paste image URLs (one per line).' },
    ],
  },
  birthday: {
    defaults: {
      language: defaultLanguage,
      celebrantName: '',
      age: '30',
      date: '2026-09-12',
      time: '19:00',
      dateLabel: 'Samedi 12 Septembre 2026',
      venue: 'Le Jardin des Étoiles',
      address: '14 Avenue de la Fête, 75008 Paris',
      mapsUrl: 'https://maps.google.com/?q=Le+Jardin+des+Etoiles+Paris',
      description: "Et j’aimerais beaucoup célébrer ce moment avec vous.",
      handwrittenMessage: "Cette année encore, j’ai envie de partager un moment rempli de rires, de bonheur et de beaux souvenirs avec les personnes qui comptent le plus pour moi.",
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      finalMessage: 'À très bientôt pour faire la fête !',
      whatsappPhone: '+33600000000',
      musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
      program: [
        { time: '19:00', title: 'Accueil & Coupe de bienvenue', description: 'Cocktails signature, musique douce et retrouvailles.' },
        { time: '21:00', title: 'Gâteau & Bougie à vœu', description: 'Moment magique pour souffler les bougies et trinquer ensemble.' },
        { time: '22:30', title: 'Soirée dansante & DJ Set', description: 'Piste de danse, rires et souvenirs inoubliables.' },
      ],
      storyItems: [
        { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=80', caption: 'Les premiers souvenirs ❤️' },
        { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&auto=format&fit=crop&q=80', caption: 'Des moments inoubliables ✨' },
        { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=80', caption: 'Entouré(e) de ceux qui comptent le plus' },
        { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop&q=80', caption: 'Et encore plein d’aventures à venir… 🚀' },
      ],
      giftOptions: [
        { title: 'Cagnotte Voyage de Rêve', description: 'Une participation libre pour m’aider à concrétiser mon prochain grand voyage sous les tropiques 🌴', icon: '✈️', link: 'https://lepotcommun.fr' },
        { title: 'Liste de Souhaits & Idées', description: 'Quelques inspirations de livres, déco et expériences gourmandes', icon: '🎁', link: '#' },
      ],
      wishes: [
        { name: 'Sophie & Thomas', message: 'Joyeux anniversaire ! Que cette nouvelle décennie t’apporte bonheur, voyages et rires infinis ! 🥂✨' },
        { name: 'Julien M.', message: 'Hâte de trinquer avec toi pour ce grand cap ! Ne change rien, tu es formidable. ❤️' },
      ],
      gallery: [],
    },
    fields: [
      { key: 'celebrantName', label: 'Nom du fêté (Celebrant Name)', type: 'text', required: true, placeholder: 'Camille', section: 'main' },
      { key: 'age', label: 'Âge célébré (Age)', type: 'text', placeholder: '30', section: 'main' },
      { key: 'profilePhoto', label: 'Photo de profil / Portrait (URL)', type: 'text', placeholder: 'https://images.unsplash.com/...', section: 'main' },
      { key: 'date', label: 'Date de l’anniversaire', type: 'date', required: true, section: 'main' },
      { key: 'time', label: 'Heure', type: 'text', placeholder: '19:00', section: 'main' },
      { key: 'dateLabel', label: 'Date affichée (e.g. Samedi 12 Septembre 2026)', type: 'text', placeholder: 'Samedi 12 Septembre 2026', section: 'main' },
      { key: 'venue', label: 'Nom du lieu', type: 'text', required: true, placeholder: 'Le Jardin des Étoiles', section: 'venue' },
      { key: 'address', label: 'Adresse complète', type: 'text', placeholder: '14 Avenue de la Fête, 75008 Paris', section: 'venue' },
      { key: 'mapsUrl', label: 'Lien Google Maps', type: 'url', placeholder: 'https://maps.google.com/?q=...', section: 'venue' },
      { key: 'description', label: 'Texte d’invitation (Hero reveal)', type: 'textarea', placeholder: 'Et j’aimerais beaucoup célébrer ce moment avec vous.', section: 'main' },
      { key: 'handwrittenMessage', label: 'Message manuscrit personnel (Un petit mot…)', type: 'textarea', placeholder: 'Cette année encore, j’ai envie de partager un moment rempli de rires...', section: 'main' },
      { key: 'finalMessage', label: 'Message de fin (Celebration finale)', type: 'text', placeholder: 'À très bientôt pour faire la fête !', section: 'main' },
      { key: 'musicUrl', label: 'Musique de fond (URL audio mp3)', type: 'text', placeholder: 'https://...', section: 'extra' },
      { key: 'language', label: 'Langue', type: 'select', required: true, section: 'main', options: [
        { label: 'Français (French)', value: 'fr' },
        { label: 'English', value: 'en' },
        { label: 'العربية (Arabic)', value: 'ar' },
      ] },
      { key: 'whatsappPhone', label: 'Numéro WhatsApp pour les RSVP', type: 'text', placeholder: '+33600000000', helperText: 'Les invités cliquent sur le bouton pour confirmer leur présence directement sur ce WhatsApp.', section: 'rsvp' },
      {
        key: 'storyItems',
        label: 'Galerie Souvenirs avec légendes (The Birthday Story)',
        type: 'repeatable-list',
        section: 'gallery',
        itemFields: [
          { key: 'url', label: 'Photo URL', type: 'text', required: true, placeholder: 'https://...' },
          { key: 'caption', label: 'Légende photo', type: 'text', required: true, placeholder: 'Les premiers souvenirs ❤️' },
        ],
      },
      {
        key: 'giftOptions',
        label: 'Cagnotte & Liste de souhaits (Gift / Wishlist)',
        type: 'repeatable-list',
        section: 'extra',
        itemFields: [
          { key: 'title', label: 'Titre du cadeau / cagnotte', type: 'text', required: true, placeholder: 'Cagnotte Voyage de Rêve' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Participation libre pour mon projet...' },
          { key: 'link', label: 'Lien web cagnotte / boutique', type: 'text', placeholder: 'https://...' },
          { key: 'icon', label: 'Icône (Emoji)', type: 'text', placeholder: '✈️' },
        ],
      },
      {
        key: 'program',
        label: 'Programme de la fête (Optionnel)',
        type: 'repeatable-list',
        section: 'schedule',
        itemFields: [
          { key: 'time', label: 'Heure', type: 'text', required: true, placeholder: '19:00' },
          { key: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Accueil & Cocktails' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Retrouvailles et musique' },
        ],
      },
      {
        key: 'wishes',
        label: 'Livre d’or des souhaits (Wishes)',
        type: 'repeatable-list',
        section: 'wishes',
        itemFields: [
          { key: 'name', label: 'Nom de l’ami(e)', type: 'text', required: true, placeholder: 'Sophie' },
          { key: 'message', label: 'Message de souhait', type: 'textarea', required: true, placeholder: 'Joyeux anniversaire ! ✨' },
        ],
      },
      { key: 'gallery', label: 'Photos simples supplémentaires (URLs)', type: 'image', section: 'gallery', helperText: 'Ajoutez des URLs d’images (une par ligne).' },
    ],
  },
  graduation: {
    defaults: {
      language: defaultLanguage,
      graduateName: 'مهندس أحمد المنصور',
      degree: 'بكالوريوس هندسة الذكاء الاصطناعي',
      university: 'جامعة الملك فهد للبترول والمعادن',
      honors: 'مرتبة الشرف الأولى',
      classYear: '2025',
      date: '2025-07-20',
      time: '07:30 PM',
      dayName: 'يوم الأحد',
      dayNumber: '20',
      yearNumber: '2025',
      venue: 'قاعة القصر الكبرى للاحتفالات',
      address: 'طريق التميز الأكاديمي، حي النخيل، الرياض',
      mapsUrl: 'https://maps.google.com/?q=graduation+venue',
      description: 'بمشاعر الفخر والاعتزاز وبتوفيق من الله العلي القدير، يسرنا دعوتكم لمشاركتنا فرحة تخرج نجلنا واحتفالنا بنيله درجة البكالوريوس مع مرتبة الشرف، لتكتمل سعادتنا بحضوركم الكريم.',
      whatsappPhone: '33600000000',
      program: [
        { time: '07:30 م', title: 'استقبال الضيوف الكرام', description: 'الترحيب بالأهل والأصدقاء والأساتذة الكرام مع تقديم القهوة والضيافة الفاخرة' },
        { time: '08:30 م', title: 'المسيرة الأكاديمية واستلام وسام التميز', description: 'دخول الخريج في مسيرة الشرف واستلام شهادة التخرج ودرع التكريم' },
        { time: '09:30 م', title: 'كلمة الخريج ومراسم رمي القبعات', description: 'كلمة شكر وامتنان للأهل والأساتذة ولحظة رمي قبعات التخرج الاحتفالية 🎓' },
        { time: '10:15 م', title: 'مأدبة العشاء السلطانية', description: 'بوفيه عشاء فاخر احتفاءً بهذه المناسبة السعيدة' },
        { time: '11:15 م', title: 'السهرة الاحتفالية والتقاط الصور التذكارية', description: 'موسيقى احتفالية والتقاط الصور التذكارية مع الخريج' },
      ],
      wishes: [
        { name: 'عائلة الخريج', message: 'ألف ألف مبروك التخرج والتفوق يا فخرنا وسندنا! من نجاح لنجاح دائم يا رب 🎓🌟' },
        { name: 'د. خالد العمري', message: 'مبارك التخرج مع مرتبة الشرف الأولى، كنت طالباً استثنائياً ومستقبلك باهر بإذن الله 👑📚' },
        { name: 'أصدقاء الدفعة', message: 'مبروك يا مهندسنا الغالي! ليلة تاريخية وأجمل تتويج لسنين التعب والاجتهاد 🥂🎉' },
      ],
      gallery: [],
    },
    fields: [
      { key: 'graduateName', label: 'Graduate Name (اسم الخريج/الخريجة)', type: 'text', required: true, placeholder: 'مهندس أحمد المنصور / Dr. Sarah Al-Otaibi', section: 'main' },
      { key: 'degree', label: 'Degree / Major (الدرجة العلمية والتخصص)', type: 'text', required: true, placeholder: 'بكالوريوس هندسة الذكاء الاصطناعي / Master of Science', section: 'main' },
      { key: 'university', label: 'University / Academy (الجامعة أو الكلية)', type: 'text', placeholder: 'جامعة الملك فهد / Harvard University', section: 'main' },
      { key: 'honors', label: 'Honors / Distinction (مرتبة الشرف والتقدير)', type: 'text', placeholder: 'مرتبة الشرف الأولى / Summa Cum Laude', section: 'main' },
      { key: 'classYear', label: 'Graduation Class Year (دفعة التخرج)', type: 'text', placeholder: 'Class of 2025', section: 'main' },
      { key: 'date', label: 'Ceremony Date (تاريخ الحفل)', type: 'date', required: true, section: 'main' },
      { key: 'time', label: 'Ceremony Time (الوقت)', type: 'text', placeholder: '07:30 PM / 07:30 مساءً', section: 'main' },
      { key: 'dayName', label: 'Day Name (اليوم)', type: 'text', placeholder: 'يوم الأحد / Sunday', section: 'main' },
      { key: 'dayNumber', label: 'Day Number', type: 'text', placeholder: '20', section: 'main' },
      { key: 'yearNumber', label: 'Year Number', type: 'text', placeholder: '2025', section: 'main' },
      { key: 'venue', label: 'Venue Name (اسم القاعة)', type: 'text', required: true, placeholder: 'قاعة القصر الكبرى / Grand Symphony Hall', section: 'venue' },
      { key: 'address', label: 'Venue Address (العنوان)', type: 'text', placeholder: 'طريق التميز الأكاديمي، الرياض', section: 'venue' },
      { key: 'mapsUrl', label: 'Google Maps Link', type: 'url', placeholder: 'https://maps.google.com/?q=...', section: 'venue' },
      { key: 'description', label: 'Invitation Message (نص الدعوة)', type: 'textarea', placeholder: 'بمشاعر الفخر والاعتزاز وبتوفيق من الله...', section: 'main' },
      { key: 'language', label: 'Language', type: 'select', required: true, section: 'main', options: [
        { label: 'Arabic (العربية)', value: 'ar' },
        { label: 'English', value: 'en' },
        { label: 'French (Français)', value: 'fr' },
      ] },
      { key: 'whatsappPhone', label: 'WhatsApp RSVP Number', type: 'text', placeholder: '+33600000000', helperText: 'Guests can confirm attendance and send congratulations directly via WhatsApp.', section: 'rsvp' },
      {
        key: 'program',
        label: 'Ceremony & Banquet Schedule (برنامج الحفل)',
        type: 'repeatable-list',
        section: 'schedule',
        itemFields: [
          { key: 'time', label: 'Time (الوقت)', type: 'text', required: true, placeholder: '08:00 PM' },
          { key: 'title', label: 'Event Title (عنوان الفقرة)', type: 'text', required: true, placeholder: 'المسيرة الأكاديمية' },
          { key: 'description', label: 'Description (التفاصيل)', type: 'textarea', placeholder: 'مسيرة دخول الخريجين وتكريم المتفوقين' },
        ],
      },
      {
        key: 'wishes',
        label: 'Guest Wishes & Congratulations (دفتر التهاني والتبريكات)',
        type: 'repeatable-list',
        section: 'wishes',
        itemFields: [
          { key: 'name', label: 'Name (المهنئ)', type: 'text', required: true, placeholder: 'د. خالد / Sarah' },
          { key: 'message', label: 'Message (التهنئة)', type: 'textarea', required: true, placeholder: 'ألف مبروك التخرج والتفوق 🎓' },
        ],
      },
      { key: 'gallery', label: 'Gallery Photos (صور المعرض والتخرج)', type: 'image', section: 'gallery' },
    ],
  },
  business: {
    defaults: {
      language: defaultLanguage,
      companyName: '',
      eventTitle: '',
      subtitle: '',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapsUrl: '',
      description: '',
      whatsappPhone: '',
      agenda: [
        { time: '09:00 AM', title: 'Opening Keynote & Vision', description: 'Welcome address and strategy presentation' },
        { time: '11:30 AM', title: 'Panel: Industry Innovations', description: 'Discussion with keynote industry leaders' },
        { time: '02:00 PM', title: 'Networking & Technology Showcase', description: 'Product demos and networking session' },
      ],
      gallery: [],
    },
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', required: true, placeholder: 'Apex Global Enterprises', section: 'main' },
      { key: 'eventTitle', label: 'Event Title', type: 'text', required: true, placeholder: 'Tech Innovations Summit 2025', section: 'main' },
      { key: 'subtitle', label: 'Subtitle / Tagline', type: 'text', placeholder: 'Connecting Global Leaders & Visionaries', section: 'main' },
      { key: 'date', label: 'Date', type: 'date', required: true, section: 'main' },
      { key: 'time', label: 'Time', type: 'text', placeholder: '09:00 AM - 05:00 PM', section: 'main' },
      { key: 'venue', label: 'Venue', type: 'text', required: true, placeholder: 'Metropolitan Convention Center', section: 'venue' },
      { key: 'address', label: 'Address', type: 'text', placeholder: '500 Business Avenue, Tech Hub City', section: 'venue' },
      { key: 'mapsUrl', label: 'Google Maps Link', type: 'url', placeholder: 'https://maps.google.com/?q=...', section: 'venue' },
      { key: 'description', label: 'Overview / Description', type: 'textarea', placeholder: 'Join industry pioneers for keynote speeches and networking...', section: 'main' },
      { key: 'language', label: 'Language', type: 'select', required: true, section: 'main', options: [
        { label: 'French', value: 'fr' },
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
      ] },
      { key: 'whatsappPhone', label: 'RSVP WhatsApp Number', type: 'text', placeholder: '+33600000000', section: 'rsvp' },
      {
        key: 'agenda',
        label: 'Conference Agenda / Schedule',
        type: 'repeatable-list',
        section: 'schedule',
        itemFields: [
          { key: 'time', label: 'Time', type: 'text', required: true, placeholder: '09:00 AM' },
          { key: 'title', label: 'Session Title', type: 'text', required: true, placeholder: 'Opening Keynote' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Session highlights' },
        ],
      },
      { key: 'gallery', label: 'Event Photos / Logos', type: 'image', section: 'gallery' },
    ],
  },
  gala: {
    defaults: {
      language: defaultLanguage,
      hostName: '',
      eventTitle: '',
      subtitle: '',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapsUrl: '',
      description: '',
      dressCode: 'Black Tie Optional',
      whatsappPhone: '',
      program: [
        { time: '07:00 PM', title: 'Red Carpet & Champagne Reception', description: 'Arrival of distinguished guests' },
        { time: '08:30 PM', title: 'Gala Dinner & Awards Ceremony', description: 'Prestigious evening banquet' },
        { time: '10:30 PM', title: 'Grand Ball & Midnight Soiree', description: 'Live orchestra and dancing' },
      ],
      wishes: [],
      gallery: [],
    },
    fields: [
      { key: 'hostName', label: 'Host / Organization', type: 'text', required: true, placeholder: 'Maison Dorée', section: 'main' },
      { key: 'eventTitle', label: 'Gala Title', type: 'text', required: true, placeholder: 'Midnight Luxe Gala', section: 'main' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'An Evening of Elegance and Prestige', section: 'main' },
      { key: 'date', label: 'Date', type: 'date', required: true, section: 'main' },
      { key: 'time', label: 'Time', type: 'text', placeholder: '07:00 PM', section: 'main' },
      { key: 'dressCode', label: 'Dress Code', type: 'text', placeholder: 'Black Tie / Tenue de soirée', section: 'main' },
      { key: 'venue', label: 'Venue', type: 'text', required: true, placeholder: 'Palais des Étoiles', section: 'venue' },
      { key: 'address', label: 'Address', type: 'text', placeholder: '78 Royal Promenade', section: 'venue' },
      { key: 'mapsUrl', label: 'Google Maps Link', type: 'url', placeholder: 'https://maps.google.com/?q=...', section: 'venue' },
      { key: 'description', label: 'Gala Description', type: 'textarea', placeholder: 'We are honored to welcome you to our annual gala...', section: 'main' },
      { key: 'language', label: 'Language', type: 'select', required: true, section: 'main', options: [
        { label: 'French', value: 'fr' },
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
      ] },
      { key: 'whatsappPhone', label: 'RSVP WhatsApp Number', type: 'text', placeholder: '+33600000000', section: 'rsvp' },
      {
        key: 'program',
        label: 'Gala Evening Itinerary',
        type: 'repeatable-list',
        section: 'schedule',
        itemFields: [
          { key: 'time', label: 'Time', type: 'text', required: true, placeholder: '07:00 PM' },
          { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Red Carpet' },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Champagne reception' },
        ],
      },
      { key: 'gallery', label: 'Gallery Images', type: 'image', section: 'gallery' },
    ],
  },
  custom: {
    defaults: {
      language: defaultLanguage,
      title: '',
      subtitle: '',
      date: '',
      time: '',
      venue: '',
      address: '',
      mapsUrl: '',
      description: '',
      whatsappPhone: '',
      program: [
        { time: '19:00', title: 'Accueil des invités', description: 'Arrivée et rafraîchissements' },
        { time: '20:30', title: 'Célébration', description: 'Moment fort de la fête' },
      ],
      wishes: [],
      gallery: [],
    },
    fields: [
      { key: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'Celebration of Life', section: 'main' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'A gathering of friends and family', section: 'main' },
      { key: 'date', label: 'Date', type: 'date', required: true, section: 'main' },
      { key: 'time', label: 'Time', type: 'text', placeholder: '19:00', section: 'main' },
      { key: 'venue', label: 'Venue', type: 'text', required: true, placeholder: 'The View Lounge', section: 'venue' },
      { key: 'address', label: 'Address', type: 'text', placeholder: '45 Avenue de la République', section: 'venue' },
      { key: 'mapsUrl', label: 'Google Maps Link', type: 'url', placeholder: 'https://maps.google.com/?q=...', section: 'venue' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe your event...', section: 'main' },
      { key: 'language', label: 'Language', type: 'select', required: true, section: 'main', options: [
        { label: 'French', value: 'fr' },
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
      ] },
      { key: 'whatsappPhone', label: 'WhatsApp RSVP Number', type: 'text', placeholder: '+33600000000', section: 'rsvp' },
      {
        key: 'program',
        label: 'Event Schedule (Programme)',
        type: 'repeatable-list',
        section: 'schedule',
        itemFields: [
          { key: 'time', label: 'Time', type: 'text', required: true, placeholder: '19:00' },
          { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Welcome' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
      {
        key: 'wishes',
        label: 'Guest Wishes & Messages',
        type: 'repeatable-list',
        section: 'wishes',
        itemFields: [
          { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Guest name' },
          { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Best wishes!' },
        ],
      },
      { key: 'gallery', label: 'Gallery Images', type: 'image', section: 'gallery' },
    ],
  },
};

export function getEventFieldConfig(eventType: EventType) {
  return eventFieldSchemas[eventType] ?? eventFieldSchemas.custom;
}

export function normalizeEventType(value: string): EventType {
  const normalized = value.toLowerCase();
  if (normalized === 'wedding') return 'wedding';
  if (normalized === 'birthday') return 'birthday';
  if (normalized === 'graduation' || normalized === 'graduate') return 'graduation';
  if (normalized === 'business' || normalized === 'corporate' || normalized === 'conference') return 'business';
  if (normalized === 'gala') return 'gala';
  return 'custom';
}

export const defaultEventTypeByTemplate: Record<string, EventType> = {
  'magic-birthday': 'birthday',
  'emma-james': 'wedding',
  'wedding-inv': 'wedding',
  'twain-love': 'wedding',
  'golden-glow': 'wedding',
  'modern-bloom': 'birthday',
  'corporate-luxe': 'graduation',
  'midnight-gala': 'gala',
};

export function defaultDynamicDataForEvent(eventType: EventType) {
  const config = getEventFieldConfig(eventType);
  const base = { ...config.defaults } as Record<string, unknown>;

  for (const field of config.fields) {
    if (!(field.key in base)) {
      if (field.type === 'repeatable-list') base[field.key] = [];
      else if (field.type === 'select') base[field.key] = defaultLanguage;
      else if (field.type === 'image') base[field.key] = [];
      else base[field.key] = '';
    }
  }

  return base;
}

export const baseInvitationDataSchema = z.object({
  language: z.string().default(defaultLanguage),
  date: z.string().optional().or(z.literal('')),
  time: z.string().optional().or(z.literal('')),
  dayName: z.string().optional(),
  dayNumber: z.string().optional(),
  yearNumber: z.string().optional(),
  dateLabel: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  mapsUrl: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  whatsappPhone: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  program: z.array(z.record(z.unknown())).optional().default([]),
  schedule: z.array(z.record(z.unknown())).optional().default([]),
  agenda: z.array(z.record(z.unknown())).optional().default([]),
  wishes: z.array(z.record(z.unknown())).optional().default([]),
  storyEvents: z.array(z.record(z.unknown())).optional().default([]),
  speakers: z.array(z.record(z.unknown())).optional().default([]),
}).passthrough();

export function getEventSchemaForType(eventType: EventType) {
  switch (eventType) {
    case 'wedding':
      return baseInvitationDataSchema.extend({
        brideName: z.string().min(1, 'Bride name is required'),
        groomName: z.string().min(1, 'Groom name is required'),
      });
    case 'birthday':
      return baseInvitationDataSchema.extend({
        celebrantName: z.string().min(1, 'Celebrant name is required'),
      });
    case 'graduation':
      return baseInvitationDataSchema.extend({
        graduateName: z.string().min(1, 'Graduate name is required'),
      });
    case 'business':
      return baseInvitationDataSchema.extend({
        companyName: z.string().min(1, 'Company name is required'),
        eventTitle: z.string().min(1, 'Event title is required'),
      });
    case 'gala':
      return baseInvitationDataSchema.extend({
        hostName: z.string().min(1, 'Host / Organization name is required'),
      });
    default:
      return baseInvitationDataSchema.extend({
        title: z.string().min(1, 'Event title is required'),
      });
  }
}

export function isValidGoogleMapsUrl(value: string) {
  const result = googleMapsUrlSchema.safeParse(value);
  return result.success;
}
