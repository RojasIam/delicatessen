import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { defaultSiteConfig, SiteConfig } from "@/lib/site-config";
import { readSiteConfig, writeSiteConfig } from "@/lib/site-config-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const config = await readSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ ok: false, error: "Supabase env missing" }, { status: 500 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const {
      data: { user },
      error: userError
    } = await authClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const serviceClient = createSupabaseServerClient();
    const { data: adminUser, error: adminError } = await serviceClient
      .from("admin_users")
      .select("is_active")
      .eq("user_id", user.id)
      .maybeSingle();
    if (adminError || !adminUser?.is_active) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const payload = (await req.json()) as Partial<SiteConfig>;
    const safeConfig: SiteConfig = {
      ...defaultSiteConfig,
      ...payload,
      brand: { ...defaultSiteConfig.brand, ...payload.brand },
      contact: { ...defaultSiteConfig.contact, ...payload.contact },
      social: { ...defaultSiteConfig.social, ...payload.social },
      links: { ...defaultSiteConfig.links, ...payload.links },
      hero: { ...defaultSiteConfig.hero, ...payload.hero },
      welcome: { ...defaultSiteConfig.welcome, ...payload.welcome },
      readyCta: { ...defaultSiteConfig.readyCta, ...payload.readyCta },
      experience: { ...defaultSiteConfig.experience, ...payload.experience },
      newsletter: { ...defaultSiteConfig.newsletter, ...payload.newsletter },
      footer: { ...defaultSiteConfig.footer, ...payload.footer },
      promotions: payload.promotions ?? defaultSiteConfig.promotions,
      newsItems: payload.newsItems ?? defaultSiteConfig.newsItems,
      dishItems: payload.dishItems ?? defaultSiteConfig.dishItems
    };

    await writeSiteConfig(safeConfig);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
}
