-- Galleria promozioni: array JSON di URL (opzionale).
-- Dopo aver eseguito questo script, puoi riattivare in lib/site-config-storage.ts
-- il campo `images` in select/insert per salvare le URL extra da admin.
alter table public.promotions
  add column if not exists images jsonb not null default '[]'::jsonb;
