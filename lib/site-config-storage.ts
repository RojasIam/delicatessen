import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { defaultPromotionSeed, defaultSiteConfig, SiteConfig } from "./site-config";
import { createSupabaseServerClient } from "./supabase/server";

const dataDir = path.join(process.cwd(), "data");
const configPath = path.join(dataDir, "site-config.json");

function mergeConfig(partial: Partial<SiteConfig>): SiteConfig {
  return {
    ...defaultSiteConfig,
    ...partial,
    brand: { ...defaultSiteConfig.brand, ...partial.brand },
    contact: { ...defaultSiteConfig.contact, ...partial.contact },
    social: { ...defaultSiteConfig.social, ...partial.social },
    links: { ...defaultSiteConfig.links, ...partial.links },
    hero: { ...defaultSiteConfig.hero, ...partial.hero },
    welcome: { ...defaultSiteConfig.welcome, ...partial.welcome },
    readyCta: { ...defaultSiteConfig.readyCta, ...partial.readyCta },
    experience: { ...defaultSiteConfig.experience, ...partial.experience },
    newsletter: { ...defaultSiteConfig.newsletter, ...partial.newsletter },
    footer: { ...defaultSiteConfig.footer, ...partial.footer },
    promotions: partial.promotions ?? defaultSiteConfig.promotions,
    newsItems: partial.newsItems ?? defaultSiteConfig.newsItems,
    dishItems: partial.dishItems ?? defaultSiteConfig.dishItems
  };
}

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function readSiteConfigFromSupabase(): Promise<SiteConfig | null> {
  try {
    const supabase = createSupabaseServerClient();

    const [{ data: configRow, error: configError }, { data: promoRows, error: promoError }] = await Promise.all([
      supabase.from("site_config").select("data").eq("id", "main").maybeSingle(),
      supabase
        .from("promotions")
        .select("id, active, kind, title, description, image, cta_text, cta_link, sort_order")
        .order("sort_order", { ascending: true })
    ]);

    if (configError || promoError) return null;

    const configData = (configRow?.data ?? {}) as Partial<SiteConfig>;
    const fromDb = (promoRows ?? []).map((row) => ({
      id: row.id,
      active: row.active,
      kind: row.kind,
      title: row.title,
      description: row.description,
      image: row.image,
      ctaText: row.cta_text,
      ctaLink: row.cta_link
    }));
    /* Tabella promotions vuota: mostra almeno la promo di default (evita sezione sparita). */
    const promotions = fromDb.length > 0 ? fromDb : defaultPromotionSeed;

    return mergeConfig({ ...configData, promotions });
  } catch {
    return null;
  }
}

async function writeSiteConfigToSupabase(config: SiteConfig): Promise<boolean> {
  try {
    const supabase = createSupabaseServerClient();
    const { promotions, ...configWithoutPromotions } = config;

    const configUpsert = supabase.from("site_config").upsert(
      {
        id: "main",
        data: configWithoutPromotions,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    const deletePromotions = supabase.from("promotions").delete().neq("id", "__none__");
    const insertPromotions =
      promotions.length > 0
        ? supabase.from("promotions").insert(
            promotions.map((promo, index) => ({
              id: promo.id,
              active: promo.active,
              kind: promo.kind,
              title: promo.title,
              description: promo.description,
              image: promo.image,
              cta_text: promo.ctaText,
              cta_link: promo.ctaLink,
              sort_order: index
            }))
          )
        : Promise.resolve({ error: null });

    const [configResult, deleteResult, insertResult] = await Promise.all([
      configUpsert,
      deletePromotions,
      insertPromotions
    ]);

    return !configResult.error && !deleteResult.error && !insertResult.error;
  } catch {
    return false;
  }
}

export async function readSiteConfig(): Promise<SiteConfig> {
  if (hasSupabaseEnv()) {
    const supabaseConfig = await readSiteConfigFromSupabase();
    if (supabaseConfig) return supabaseConfig;
  }

  try {
    const file = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(file) as Partial<SiteConfig>;
    return mergeConfig(parsed);
  } catch {
    return defaultSiteConfig;
  }
}

export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  if (hasSupabaseEnv()) {
    const written = await writeSiteConfigToSupabase(config);
    if (written) return;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}
