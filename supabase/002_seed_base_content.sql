-- DELICATESSEN - optional seed
-- Run after 001_init_admin_schema.sql

begin;

insert into public.site_config (id, data)
values (
  'main',
  '{
    "brand": { "name": "DELICATESSEN", "tagline": "L''Alto Adige a tavola" },
    "contact": {
      "address": "Viale Tunisia 14 Milano",
      "mapsUrl": "https://maps.app.goo.gl/ou63Jqrq283cNFyi9",
      "email": "mailto:prenotazioni@ristorantedelicatessen.com",
      "emailLabel": "prenotazioni@ristorantedelicatessen.com",
      "phoneLabel": "Tel 02 29529555",
      "phoneRaw": "+39 0229529555",
      "phoneHref": "tel:+390229529555",
      "whatsappUrl": "https://api.whatsapp.com/send?phone=393347539136"
    },
    "social": {
      "facebook": "https://www.facebook.com/ristorantedelicatessen",
      "instagram": "https://www.instagram.com/ristorantedelicatessenmilano"
    },
    "links": {
      "menu": "#menu",
      "wines": "#menu",
      "booking": "#prenota",
      "shop": "#prenota",
      "privacyPolicy": "#"
    }
  }'::jsonb
)
on conflict (id) do update
set data = excluded.data;

-- Example promo (can be edited/removed from admin panel)
insert into public.promotions (id, active, kind, title, description, image, cta_text, cta_link, sort_order)
values
  (
    'promo-benessere-aperitivo',
    true,
    'aperitivo',
    'Aperitivo Delicatessen',
    'Ogni sera una selezione premium di calici e piccoli assaggi della casa.',
    '/FOTO_2.webp',
    'Prenota ora',
    '#prenota',
    1
  )
on conflict (id) do nothing;

commit;
