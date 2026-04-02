import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function isAuthorizedAdmin(req: Request): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return { ok: false, status: 401, error: "Unauthorized" };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { ok: false, status: 500, error: "Supabase env missing" };

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const {
    data: { user },
    error: userError
  } = await authClient.auth.getUser(token);
  if (userError || !user) return { ok: false, status: 401, error: "Invalid token" };

  const serviceClient = createSupabaseServerClient();
  const { data: adminUser, error: adminError } = await serviceClient
    .from("admin_users")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError || !adminUser?.is_active) return { ok: false, status: 403, error: "Forbidden" };

  return { ok: true };
}

export async function GET(req: Request) {
  const auth = await isAuthorizedAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const serviceClient = createSupabaseServerClient();
  const { data, error } = await serviceClient
    .from("admin_users")
    .select("user_id, email, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: "Cannot load admin users" }, { status: 500 });
  return NextResponse.json({ ok: true, users: data });
}

export async function POST(req: Request) {
  const auth = await isAuthorizedAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) return NextResponse.json({ ok: false, error: "Email required" }, { status: 400 });

    const serviceClient = createSupabaseServerClient();
    const { data: authUsers, error: authUsersError } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authUsersError) return NextResponse.json({ ok: false, error: "Cannot read auth users" }, { status: 500 });

    const match = authUsers.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Utente non trovato in Authentication > Users. Crealo prima." },
        { status: 404 }
      );
    }

    const { error } = await serviceClient.from("admin_users").upsert(
      {
        user_id: match.id,
        email: match.email,
        is_active: true
      },
      { onConflict: "user_id" }
    );
    if (error) return NextResponse.json({ ok: false, error: "Cannot add admin user" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const auth = await isAuthorizedAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    const { userId, isActive } = (await req.json()) as { userId?: string; isActive?: boolean };
    if (!userId || typeof isActive !== "boolean") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const serviceClient = createSupabaseServerClient();
    const { error } = await serviceClient.from("admin_users").update({ is_active: isActive }).eq("user_id", userId);
    if (error) return NextResponse.json({ ok: false, error: "Cannot update admin user" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const auth = await isAuthorizedAdmin(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    const { userId } = (await req.json()) as { userId?: string };
    if (!userId) return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });

    const serviceClient = createSupabaseServerClient();
    const { error } = await serviceClient.from("admin_users").delete().eq("user_id", userId);
    if (error) return NextResponse.json({ ok: false, error: "Cannot remove admin user" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
}
