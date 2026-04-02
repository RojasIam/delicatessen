"use client";

import { ChangeEvent, FormEvent, useMemo, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { defaultSiteConfig, PromotionItem, SiteConfig } from "@/lib/site-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type FlatField =
  | "brand.name"
  | "brand.tagline"
  | "contact.address"
  | "contact.mapsUrl"
  | "contact.email"
  | "contact.emailLabel"
  | "contact.phoneLabel"
  | "contact.phoneRaw"
  | "contact.phoneHref"
  | "contact.whatsappUrl"
  | "social.facebook"
  | "social.instagram"
  | "links.shop"
  | "links.privacyPolicy"
  | "hero.ctaText"
  | "hero.image"
  | "welcome.title"
  | "welcome.text"
  | "welcome.image"
  | "readyCta.title"
  | "readyCta.text"
  | "readyCta.buttonText"
  | "readyCta.image"
  | "experience.title"
  | "experience.subtitle"
  | "newsletter.title"
  | "newsletter.placeholder"
  | "newsletter.buttonText"
  | "newsletter.legalText"
  | "footer.copyright"
  | "footer.privacyText";

type AdminSection = "dashboard" | "site" | "promotions" | "users";
type AdminUser = {
  user_id: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

const pathSetters: Record<FlatField, (value: string, prev: SiteConfig) => SiteConfig> = {
  "brand.name": (value, prev) => ({ ...prev, brand: { ...prev.brand, name: value } }),
  "brand.tagline": (value, prev) => ({ ...prev, brand: { ...prev.brand, tagline: value } }),
  "contact.address": (value, prev) => ({ ...prev, contact: { ...prev.contact, address: value } }),
  "contact.mapsUrl": (value, prev) => ({ ...prev, contact: { ...prev.contact, mapsUrl: value } }),
  "contact.email": (value, prev) => ({ ...prev, contact: { ...prev.contact, email: value } }),
  "contact.emailLabel": (value, prev) => ({ ...prev, contact: { ...prev.contact, emailLabel: value } }),
  "contact.phoneLabel": (value, prev) => ({ ...prev, contact: { ...prev.contact, phoneLabel: value } }),
  "contact.phoneRaw": (value, prev) => ({ ...prev, contact: { ...prev.contact, phoneRaw: value } }),
  "contact.phoneHref": (value, prev) => ({ ...prev, contact: { ...prev.contact, phoneHref: value } }),
  "contact.whatsappUrl": (value, prev) => ({ ...prev, contact: { ...prev.contact, whatsappUrl: value } }),
  "social.facebook": (value, prev) => ({ ...prev, social: { ...prev.social, facebook: value } }),
  "social.instagram": (value, prev) => ({ ...prev, social: { ...prev.social, instagram: value } }),
  "links.shop": (value, prev) => ({ ...prev, links: { ...prev.links, shop: value } }),
  "links.privacyPolicy": (value, prev) => ({ ...prev, links: { ...prev.links, privacyPolicy: value } }),
  "hero.ctaText": (value, prev) => ({ ...prev, hero: { ...prev.hero, ctaText: value } }),
  "hero.image": (value, prev) => ({ ...prev, hero: { ...prev.hero, image: value } }),
  "welcome.title": (value, prev) => ({ ...prev, welcome: { ...prev.welcome, title: value } }),
  "welcome.text": (value, prev) => ({ ...prev, welcome: { ...prev.welcome, text: value } }),
  "welcome.image": (value, prev) => ({ ...prev, welcome: { ...prev.welcome, image: value } }),
  "readyCta.title": (value, prev) => ({ ...prev, readyCta: { ...prev.readyCta, title: value } }),
  "readyCta.text": (value, prev) => ({ ...prev, readyCta: { ...prev.readyCta, text: value } }),
  "readyCta.buttonText": (value, prev) => ({ ...prev, readyCta: { ...prev.readyCta, buttonText: value } }),
  "readyCta.image": (value, prev) => ({ ...prev, readyCta: { ...prev.readyCta, image: value } }),
  "experience.title": (value, prev) => ({ ...prev, experience: { ...prev.experience, title: value } }),
  "experience.subtitle": (value, prev) => ({ ...prev, experience: { ...prev.experience, subtitle: value } }),
  "newsletter.title": (value, prev) => ({ ...prev, newsletter: { ...prev.newsletter, title: value } }),
  "newsletter.placeholder": (value, prev) => ({ ...prev, newsletter: { ...prev.newsletter, placeholder: value } }),
  "newsletter.buttonText": (value, prev) => ({ ...prev, newsletter: { ...prev.newsletter, buttonText: value } }),
  "newsletter.legalText": (value, prev) => ({ ...prev, newsletter: { ...prev.newsletter, legalText: value } }),
  "footer.copyright": (value, prev) => ({ ...prev, footer: { ...prev.footer, copyright: value } }),
  "footer.privacyText": (value, prev) => ({ ...prev, footer: { ...prev.footer, privacyText: value } })
};

export default function AdminPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Caricamento...");
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [section, setSection] = useState<AdminSection>("site");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setAuthReady(true);
    };
    initAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      try {
        const res = await fetch("/api/site-config", { cache: "no-store" });
        if (!res.ok) {
          setStatus("Errore nel caricamento. Uso valori base.");
          return;
        }
        const data = (await res.json()) as SiteConfig;
        setConfig(data);
        setStatus("Configurazione caricata.");
      } catch {
        setStatus("Errore di rete. Uso valori base.");
      }
    };
    load();
  }, [session]);

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      if (!currentSession?.access_token) return;
      const res = await fetch("/api/admin-users", {
        headers: { Authorization: `Bearer ${currentSession.access_token}` }
      });
      if (!res.ok) return;
      const data = (await res.json()) as { users: AdminUser[] };
      setAdminUsers(data.users ?? []);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    loadAdminUsers();
  }, [session]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const setField = (field: FlatField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updater = pathSetters[field];
    setConfig((prev) => updater(event.target.value, prev));
  };

  const addPromotion = () => {
    const newItem: PromotionItem = {
      id: `promo-${Date.now()}`,
      active: true,
      kind: "promozione",
      title: "",
      description: "",
      image: "",
      images: [],
      ctaText: "Scopri di piu",
      ctaLink: "#"
    };
    setConfig((prev) => ({ ...prev, promotions: [...prev.promotions, newItem] }));
  };

  const removePromotion = (id: string) => {
    setConfig((prev) => ({ ...prev, promotions: prev.promotions.filter((promo) => promo.id !== id) }));
  };

  const updatePromotion = <K extends keyof PromotionItem>(id: string, key: K, value: PromotionItem[K]) => {
    setConfig((prev) => ({
      ...prev,
      promotions: prev.promotions.map((promo) => (promo.id === id ? { ...promo, [key]: value } : promo))
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus("Salvataggio in corso...");
    try {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        setStatus("Sessione scaduta. Effettua di nuovo il login.");
        setSaving(false);
        return;
      }
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify(config)
      });
      if (!res.ok) {
        setStatus("Errore durante il salvataggio.");
      } else {
        setStatus("Configurazione salvata con successo.");
      }
    } catch {
      setStatus("Errore di rete durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdminUser = async (event: FormEvent) => {
    event.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    setStatus("Aggiunta utente admin...");
    try {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        setStatus("Sessione scaduta.");
        return;
      }
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({ email })
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setStatus(body.error ?? "Errore in aggiunta admin.");
        return;
      }
      setNewAdminEmail("");
      setStatus("Utente admin aggiunto.");
      await loadAdminUsers();
    } catch {
      setStatus("Errore rete su gestione utenti.");
    }
  };

  const handleToggleAdminUser = async (userId: string, isActive: boolean) => {
    try {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      if (!currentSession?.access_token) return;
      await fetch("/api/admin-users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({ userId, isActive })
      });
      await loadAdminUsers();
    } catch {
      setStatus("Errore aggiornamento utenti admin.");
    }
  };

  const handleDeleteAdminUser = async (userId: string) => {
    try {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();
      if (!currentSession?.access_token) return;
      await fetch("/api/admin-users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({ userId })
      });
      await loadAdminUsers();
    } catch {
      setStatus("Errore rimozione admin.");
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    });
    if (error) {
      setLoginError("Login non valido o utente non autorizzato.");
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!authReady) {
    return (
      <main className="admin-page">
        <div className="admin-shell">
          <h1>Pannello DELICATESSEN</h1>
          <p>Caricamento autenticazione...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-page">
        <div className="admin-shell admin-auth-shell">
          <h1>Accesso Amministratore</h1>
          <p>Accedi con il tuo utente Supabase autorizzato.</p>
          <form className="admin-auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </label>
            {loginError ? <p className="admin-auth-error">{loginError}</p> : null}
            <button className="btn-primary" type="submit" disabled={loginLoading}>
              {loginLoading ? "Accesso..." : "Entra nel pannello"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page admin-pro-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/delilogo.webp" alt="Delicatessen" className="admin-brand-logo" />
          <span>Pannello Gestionale</span>
        </div>
        <nav className="admin-nav">
          <button className={section === "dashboard" ? "active" : ""} onClick={() => setSection("dashboard")}>
            <i className="fa-solid fa-chart-line" /> Panoramica
          </button>
          <button className={section === "site" ? "active" : ""} onClick={() => setSection("site")}>
            <i className="fa-solid fa-globe" /> Sito Web
          </button>
          <button className={section === "promotions" ? "active" : ""} onClick={() => setSection("promotions")}>
            <i className="fa-solid fa-bullhorn" /> Promozioni
          </button>
          <button className={section === "users" ? "active" : ""} onClick={() => setSection("users")}>
            <i className="fa-solid fa-users" /> Utenti Admin
          </button>
        </nav>
        <div className="admin-side-footer">
          <p>{session.user.email}</p>
          <button type="button" onClick={handleLogout}>
            Esci
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>
              {section === "dashboard"
                ? "Panoramica"
                : section === "site"
                  ? "Configurazione Sito"
                  : section === "promotions"
                    ? "Gestione Promozioni"
                    : "Gestione Utenti Admin"}
            </h1>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="admin-profile-trigger"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="admin-profile-avatar">
                  {(session.user.email?.charAt(0) ?? "A").toUpperCase()}
                </span>
                <span className="admin-profile-trigger-copy">
                  <small>Workspace Admin</small>
                  <strong>{session.user.email}</strong>
                </span>
                <i className="fa-solid fa-chevron-down" />
              </button>
              {profileOpen && (
                <div className="admin-profile-dropdown" role="menu">
                  <div className="admin-profile-dropdown-head">
                    <p>Amministratore</p>
                    <span>{session.user.email}</span>
                  </div>
                  <div className="admin-profile-dropdown-actions">
                    <a href="/" role="menuitem" onClick={() => setProfileOpen(false)}>
                      <i className="fa-solid fa-globe" /> Apri sito
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                    >
                      <i className="fa-solid fa-right-from-bracket" /> Chiudi sessione
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="admin-body-scroll">
        {section === "dashboard" && (
          <>
            <div className="admin-dashboard-cards">
              <article>
                <h4>Promozioni Attive</h4>
                <strong>{config.promotions.filter((p) => p.active).length}</strong>
              </article>
              <article>
                <h4>Totale Promozioni</h4>
                <strong>{config.promotions.length}</strong>
              </article>
              <article>
                <h4>Admin abilitati</h4>
                <strong>{adminUsers.filter((u) => u.is_active).length}</strong>
              </article>
            </div>
            <div className="admin-section-card">
              <h3>Promozioni recenti</h3>
              <div className="admin-users-table-wrap">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>Titolo</th>
                      <th>Tipo</th>
                      <th>Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.promotions.length === 0 ? (
                      <tr>
                        <td colSpan={3}>Nessuna promozione inserita.</td>
                      </tr>
                    ) : (
                      config.promotions.slice(0, 6).map((promo) => (
                        <tr key={promo.id}>
                          <td>{promo.title || "Senza titolo"}</td>
                          <td>{promo.kind}</td>
                          <td>{promo.active ? "Attiva" : "Disattiva"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {section === "site" && (
          <form className="admin-grid admin-section-card" onSubmit={onSubmit}>
            <h3 className="full">Identita & Contatti</h3>
            <label>
              Nome brand
              <input value={config.brand.name} onChange={setField("brand.name")} />
            </label>
            <label>
              Tagline
              <input value={config.brand.tagline} onChange={setField("brand.tagline")} />
            </label>
            <label>
              Indirizzo
              <input value={config.contact.address} onChange={setField("contact.address")} />
            </label>
            <label>
              Link Maps
              <input value={config.contact.mapsUrl} onChange={setField("contact.mapsUrl")} />
            </label>
            <label>
              Email href (mailto:)
              <input value={config.contact.email} onChange={setField("contact.email")} />
            </label>
            <label>
              Email visibile
              <input value={config.contact.emailLabel} onChange={setField("contact.emailLabel")} />
            </label>
            <label>
              Telefono visibile topbar
              <input value={config.contact.phoneLabel} onChange={setField("contact.phoneLabel")} />
            </label>
            <label>
              Telefono visibile footer
              <input value={config.contact.phoneRaw} onChange={setField("contact.phoneRaw")} />
            </label>
            <label>
              Telefono href (tel:)
              <input value={config.contact.phoneHref} onChange={setField("contact.phoneHref")} />
            </label>
            <label>
              WhatsApp URL
              <input value={config.contact.whatsappUrl} onChange={setField("contact.whatsappUrl")} />
            </label>
            <label>
              Facebook URL
              <input value={config.social.facebook} onChange={setField("social.facebook")} />
            </label>
            <label>
              Instagram URL
              <input value={config.social.instagram} onChange={setField("social.instagram")} />
            </label>
            <h3 className="full">Sezioni</h3>
            <label>
              Benvenuto titolo
              <input value={config.welcome.title} onChange={setField("welcome.title")} />
            </label>
            <label>
              Benvenuto immagine URL
              <input value={config.welcome.image} onChange={setField("welcome.image")} />
            </label>
            <label className="full">
              Benvenuto testo
              <textarea value={config.welcome.text} onChange={setField("welcome.text")} rows={4} />
            </label>
            <label>
              CTA sezione titolo
              <input value={config.readyCta.title} onChange={setField("readyCta.title")} />
            </label>
            <label>
              CTA sezione bottone
              <input value={config.readyCta.buttonText} onChange={setField("readyCta.buttonText")} />
            </label>
            <label>
              CTA sezione immagine URL
              <input value={config.readyCta.image} onChange={setField("readyCta.image")} />
            </label>
            <label className="full">
              CTA sezione testo
              <textarea value={config.readyCta.text} onChange={setField("readyCta.text")} rows={4} />
            </label>
            <label>
              Esperienza titolo
              <input value={config.experience.title} onChange={setField("experience.title")} />
            </label>
            <label>
              Esperienza sottotitolo
              <input value={config.experience.subtitle} onChange={setField("experience.subtitle")} />
            </label>
            <label>
              Newsletter titolo
              <input value={config.newsletter.title} onChange={setField("newsletter.title")} />
            </label>
            <label>
              Newsletter placeholder
              <input value={config.newsletter.placeholder} onChange={setField("newsletter.placeholder")} />
            </label>
            <label>
              Newsletter bottone
              <input value={config.newsletter.buttonText} onChange={setField("newsletter.buttonText")} />
            </label>
            <label className="full">
              Newsletter testo legale
              <textarea value={config.newsletter.legalText} onChange={setField("newsletter.legalText")} rows={3} />
            </label>
            <label>
              Footer copyright
              <input value={config.footer.copyright} onChange={setField("footer.copyright")} />
            </label>
            <label>
              Footer privacy text
              <input value={config.footer.privacyText} onChange={setField("footer.privacyText")} />
            </label>
            <div className="admin-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Salvataggio..." : "Salva configurazione"}
              </button>
            </div>
          </form>
        )}

        {section === "promotions" && (
          <form className="admin-section-card" onSubmit={onSubmit}>
            <div className="admin-promo-head">
              <h3>Promozioni / Eventi</h3>
              <button type="button" className="admin-add-btn" onClick={addPromotion}>
                + Aggiungi promo
              </button>
            </div>
            {config.promotions.length === 0 && (
              <p className="admin-empty-promo">
                Nessuna promozione attiva. Se non inserisci promo, la sezione sotto hero non verra mostrata.
              </p>
            )}
            <div className="admin-promo-list">
              {config.promotions.map((promo, index) => (
                <article key={promo.id} className="admin-promo-card">
                  <div className="admin-promo-row">
                    <strong>Promo {index + 1}</strong>
                    <button type="button" className="admin-remove-btn" onClick={() => removePromotion(promo.id)}>
                      Rimuovi
                    </button>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={promo.active}
                      onChange={(e) => updatePromotion(promo.id, "active", e.target.checked)}
                    />
                    Attiva in homepage
                  </label>
                  <div className="admin-grid">
                    <label>
                      Tipo
                      <select
                        value={promo.kind}
                        onChange={(e) =>
                          updatePromotion(promo.id, "kind", e.target.value as PromotionItem["kind"])
                        }
                      >
                        <option value="evento">evento</option>
                        <option value="promozione">promozione</option>
                        <option value="aperitivo">aperitivo</option>
                      </select>
                    </label>
                    <label>
                      Titolo
                      <input value={promo.title} onChange={(e) => updatePromotion(promo.id, "title", e.target.value)} />
                    </label>
                    <label>
                      Immagine principale URL (o /FOTO_1.webp)
                      <input value={promo.image} onChange={(e) => updatePromotion(promo.id, "image", e.target.value)} />
                    </label>
                    <label className="full">
                      Altre immagini galleria (una URL per riga, opzionale)
                      <textarea
                        rows={3}
                        placeholder={"/FOTO_3.webp\n/f2.jpg"}
                        value={(promo.images ?? []).join("\n")}
                        onChange={(e) =>
                          updatePromotion(
                            promo.id,
                            "images",
                            e.target.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    </label>
                    <label>
                      CTA testo
                      <input
                        value={promo.ctaText}
                        onChange={(e) => updatePromotion(promo.id, "ctaText", e.target.value)}
                      />
                    </label>
                    <label className="full">
                      CTA link
                      <input
                        value={promo.ctaLink}
                        onChange={(e) => updatePromotion(promo.id, "ctaLink", e.target.value)}
                      />
                    </label>
                    <label className="full">
                      Descrizione breve
                      <textarea
                        rows={3}
                        value={promo.description}
                        onChange={(e) => updatePromotion(promo.id, "description", e.target.value)}
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
            <div className="admin-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Salvataggio..." : "Salva promozioni"}
              </button>
            </div>
          </form>
        )}

        {section === "users" && (
          <div className="admin-section-card">
            <h3>Utenti Admin</h3>
            <p className="admin-status">Gestisci chi puo accedere e modificare il sito.</p>
            <form className="admin-user-add" onSubmit={handleAddAdminUser}>
              <input
                type="email"
                placeholder="Email utente gia creato in Supabase Auth"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
              <button type="submit" className="admin-add-btn">
                Aggiungi
              </button>
            </form>
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>UID</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsersLoading ? (
                    <tr>
                      <td colSpan={4}>Caricamento utenti...</td>
                    </tr>
                  ) : adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4}>Nessun admin registrato.</td>
                    </tr>
                  ) : (
                    adminUsers.map((user) => (
                      <tr key={user.user_id}>
                        <td>{user.email}</td>
                        <td>{user.user_id}</td>
                        <td>{user.is_active ? "Attivo" : "Disattivo"}</td>
                        <td className="admin-user-actions">
                          <button
                            type="button"
                            onClick={() => handleToggleAdminUser(user.user_id, !user.is_active)}
                            className="admin-user-btn"
                          >
                            {user.is_active ? "Disattiva" : "Attiva"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdminUser(user.user_id)}
                            className="admin-user-btn danger"
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </section>
    </main>
  );
}
