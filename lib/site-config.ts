export type CarouselItem = {
  title: string;
  image: string;
  highlight?: boolean;
};

export type PromotionItem = {
  id: string;
  active: boolean;
  kind: "evento" | "promozione" | "aperitivo";
  title: string;
  description: string;
  image: string;
  /** URL aggiuntive per la galleria geometrica (opzionale). */
  images?: string[];
  ctaText: string;
  ctaLink: string;
};

/** Promo mostrata se il DB / file non ne hanno (tabella vuota o config senza righe). */
export const defaultPromotionSeed: PromotionItem[] = [
  {
    id: "promo-benessere-aperitivo",
    active: true,
    kind: "aperitivo",
    title: "Aperitivo Delicatessen",
    description: "Ogni sera una selezione premium di calici e piccoli assaggi della casa.",
    image: "/FOTO_2.webp",
    ctaText: "Prenota ora",
    ctaLink: "#prenota"
  }
];

export type SiteConfig = {
  brand: {
    name: string;
    tagline: string;
  };
  contact: {
    address: string;
    mapsUrl: string;
    email: string;
    emailLabel: string;
    phoneLabel: string;
    phoneRaw: string;
    phoneHref: string;
    whatsappUrl: string;
  };
  social: {
    facebook: string;
    instagram: string;
  };
  links: {
    menu: string;
    wines: string;
    booking: string;
    shop: string;
    privacyPolicy: string;
  };
  hero: {
    image: string;
    ctaText: string;
  };
  welcome: {
    image: string;
    title: string;
    text: string;
  };
  readyCta: {
    image: string;
    title: string;
    text: string;
    buttonText: string;
  };
  experience: {
    label: string;
    title: string;
    subtitle: string;
  };
  newsletter: {
    title: string;
    placeholder: string;
    buttonText: string;
    legalText: string;
  };
  footer: {
    copyright: string;
    privacyText: string;
  };
  promotions: PromotionItem[];
  newsItems: CarouselItem[];
  dishItems: CarouselItem[];
};

export const defaultSiteConfig: SiteConfig = {
  brand: {
    name: "DELICATESSEN",
    tagline: "L'Alto Adige a tavola"
  },
  contact: {
    address: "Viale Tunisia 14 Milano",
    mapsUrl: "https://maps.app.goo.gl/ou63Jqrq283cNFyi9",
    email: "mailto:prenotazioni@ristorantedelicatessen.com",
    emailLabel: "prenotazioni@ristorantedelicatessen.com",
    phoneLabel: "Tel 02 29529555",
    phoneRaw: "+39 0229529555",
    phoneHref: "tel:+390229529555",
    whatsappUrl: "https://api.whatsapp.com/send?phone=393347539136"
  },
  social: {
    facebook: "https://www.facebook.com/ristorantedelicatessen",
    instagram: "https://www.instagram.com/ristorantedelicatessenmilano"
  },
  links: {
    menu: "#menu",
    wines: "/vini.pdf",
    booking: "#prenota",
    shop: "/shop",
    privacyPolicy: "#"
  },
  hero: {
    image:
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1800&q=80",
    ctaText: "PRENOTA ORA"
  },
  welcome: {
    image:
      "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1800&q=80",
    title: "DELICATESSEN MILANO",
    text:
      "Benvenuti al ristorante, da oltre 10 anni un vero angolo di gusto. Piatti tipici della tradizione in un'incantata atmosfera, tra eleganza alpina e ospitalita italiana."
  },
  readyCta: {
    image:
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1800&q=80",
    title: "Siamo Pronti ad Accoglierti",
    text:
      "Un'esperienza culinaria autentica nel cuore di Milano, con cucina italiana d'eccellenza e servizio impeccabile.",
    buttonText: "PRENOTA ORA"
  },
  experience: {
    label: "DELICATESSEN",
    title: "Vivi la Tua Esperienza",
    subtitle: "Prenota un Tavolo"
  },
  newsletter: {
    title: "ISCRIVITI ALLA NEWSLETTER",
    placeholder: "Inserisci la tua email",
    buttonText: "Iscriviti",
    legalText: "Con l'iscrizione accetti la nostra informativa privacy e comunicazioni promozionali."
  },
  footer: {
    copyright: "© 2025 All rights reserved Delicatessen.",
    privacyText: "Privacy Policy"
  },
  promotions: defaultPromotionSeed,
  newsItems: [
    { title: "Pranzo di Pasqua", image: "/FOTO_1.webp", highlight: true },
    { title: "Degustazione Alto Adige", image: "/FOTO_2.webp" },
    { title: "Wine Experience", image: "/FOTO_3.webp" },
    { title: "Cena Gourmet", image: "/FOTO_4.webp" },
    { title: "Cena Romantica", image: "/FOTO_5.webp" },
    { title: "Sala e atmosfera", image: "/f1.jpg" },
    { title: "La nostra cucina", image: "/f2.jpg" },
    { title: "Tagliere e specialità", image: "/f3.jpg" },
    { title: "Momenti in tavola", image: "/f4.jpg" },
    { title: "Carta dei vini", image: "/f5.jpg" },
    { title: "Dolci della casa", image: "/f6.jpg" },
    { title: "Brunch domenicale", image: "/f7.jpg" },
    { title: "Eventi privati", image: "/f8.jpg" },
    { title: "Tradizione alpina", image: "/FOTO_1.webp" },
    { title: "Stagione in tavola", image: "/FOTO_2.webp" },
    { title: "Chef al lavoro", image: "/FOTO_3.webp" },
    { title: "Aperitivo in terrazza", image: "/FOTO_4.webp" },
    { title: "Serata speciale", image: "/FOTO_5.webp" },
    { title: "Ospitalità italiana", image: "/f2.jpg" },
    { title: "Gusto e ricerca", image: "/f5.jpg" }
  ],
  dishItems: [
    {
      title: "Tagliatelle al Tartufo",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Risotto ai Funghi Porcini",
      image:
        "https://images.unsplash.com/photo-1604908177079-74cf2d385b34?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Filetto con Riduzione",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Tiramisu della Casa",
      image:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Gnocchi al Burro e Salvia",
      image:
        "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80"
    }
  ]
};
