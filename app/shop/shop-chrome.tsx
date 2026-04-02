"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { defaultSiteConfig, type SiteConfig } from "@/lib/site-config";
import { FlagItaly, FlagUk } from "@/components/lang-flags";
import { TopbarMobileContactRotator } from "@/components/topbar-mobile-contact-rotator";

export function ShopChrome({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"IT" | "EN">("IT");
  const [headerShadow, setHeaderShadow] = useState(false);
  const langSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setHeaderShadow(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = langSwitcherRef.current;
      if (!root) return;
      const target = e.target;
      if (target instanceof Node && !root.contains(target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [langOpen]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/site-config", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as SiteConfig;
        setConfig(data);
      } catch {
        setConfig(defaultSiteConfig);
      }
    };
    fetchConfig();
  }, []);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert("Grazie! La tua iscrizione e stata registrata.");
  };

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <a href={config.contact.mapsUrl} target="_blank" rel="noreferrer">
              <i className="fa-solid fa-location-dot" /> {config.contact.address}
            </a>
            <a href={config.contact.phoneHref}>
              <i className="fa-solid fa-phone" /> {config.contact.phoneLabel}
            </a>
            <a href={config.contact.email}>
              <i className="fa-solid fa-envelope" /> {config.contact.emailLabel}
            </a>
            <TopbarMobileContactRotator
              phoneHref={config.contact.phoneHref}
              phoneLabel={config.contact.phoneLabel}
              emailHref={config.contact.email}
              emailLabel={config.contact.emailLabel}
            />
          </div>
          <div className="topbar-right">
            <a href={config.social.facebook} target="_blank" rel="noreferrer">
              <i className="fa-brands fa-facebook-f" /> Facebook
            </a>
            <a href={config.social.instagram} target="_blank" rel="noreferrer">
              <i className="fa-brands fa-instagram" /> Instagram
            </a>
          </div>
        </div>
      </div>

      <header className={`main-header ${headerShadow ? "scrolled" : ""}`}>
        <div className="container header-inner">
          <a className="logo" href="/" aria-label="DELICATESSEN Home">
            <img src="/delilogo.webp" alt="Logo Delicatessen" className="logo-image" />
          </a>
          <div className="header-actions">
            <nav className="main-nav" aria-label="Navigazione principale">
              <a href="/vini.pdf" target="_blank" rel="noopener noreferrer">
                Carta dei Vini
              </a>
              <a href="/#prenota">Prenota</a>
              <a href="/shop" aria-current="page">
                Shop
              </a>
            </nav>
            <div className="lang-switcher lang-switcher--header" ref={langSwitcherRef}>
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                aria-label={activeLang === "IT" ? "Lingua: italiano. Apri menu lingue" : "Language: English. Open language menu"}
              >
                <span className="lang-flag-slot lang-flag-slot--trigger" aria-hidden>
                  {activeLang === "IT" ? <FlagItaly className="lang-flag-svg" /> : <FlagUk className="lang-flag-svg" />}
                </span>
                <i className={`fa-solid ${langOpen ? "fa-chevron-up" : "fa-chevron-down"} lang-chevron`} aria-hidden />
              </button>
              {langOpen && (
                <div className="lang-dropdown lang-dropdown--flags" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    aria-label="English"
                    className={activeLang === "EN" ? "is-active" : ""}
                    onClick={() => {
                      setActiveLang("EN");
                      setLangOpen(false);
                    }}
                  >
                    <span className="lang-flag-slot" aria-hidden>
                      <FlagUk className="lang-flag-svg" />
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    aria-label="Italiano"
                    className={activeLang === "IT" ? "is-active" : ""}
                    onClick={() => {
                      setActiveLang("IT");
                      setLangOpen(false);
                    }}
                  >
                    <span className="lang-flag-slot" aria-hidden>
                      <FlagItaly className="lang-flag-svg" />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {children}

      <section className="newsletter site-footer-block" aria-label="Newsletter">
        <div className="container">
          <div className="newsletter-inner">
            <h6>{config.newsletter.title}</h6>
            <form onSubmit={handleNewsletterSubmit}>
              <input type="email" placeholder={config.newsletter.placeholder} required />
              <button type="submit">{config.newsletter.buttonText}</button>
            </form>
            <p className="newsletter-legal">{config.newsletter.legalText}</p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <div className="footer-contacts-bar">
              <a href={config.contact.email}>
                <i className="fa-solid fa-envelope" aria-hidden />
                {config.contact.emailLabel}
              </a>
              <a href={config.contact.phoneHref}>
                <i className="fa-solid fa-phone" aria-hidden />
                {config.contact.phoneRaw}
              </a>
            </div>
            <div className="footer-meta">
              <p>{config.footer.copyright}</p>
              <a href={config.links.privacyPolicy}>{config.footer.privacyText}</a>
            </div>
          </div>
        </div>
      </footer>

      <a
        className="whatsapp-floating"
        href="/#prenota"
        aria-label="Prenotazioni — apri il calendario"
      >
        <i className="fa-brands fa-whatsapp" aria-hidden />
        Prenotazioni
      </a>
    </>
  );
}
