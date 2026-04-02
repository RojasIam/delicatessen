"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { defaultSiteConfig, SiteConfig } from "@/lib/site-config";
import { expandQuadSources, promotionQuadUrls } from "@/lib/promotion-gallery";
import { FlagItaly, FlagUk } from "@/components/lang-flags";
import { TopbarMobileContactRotator } from "@/components/topbar-mobile-contact-rotator";
import { HomeMobileNavDrawerContent } from "@/components/home-mobile-nav-drawer-content";

const MOBILE_NAV_MQ = "(max-width: 767px)";

function subscribeMobileNavViewport(cb: () => void) {
  const mq = window.matchMedia(MOBILE_NAV_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileNavViewport() {
  return window.matchMedia(MOBILE_NAV_MQ).matches;
}

const PASQUA_SPLIT_IMAGES = expandQuadSources(["/f2.jpg", "/f4.jpg", "/f6.jpg", "/f8.jpg"]);

const weekdayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const monthLabels = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre"
];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthTitle(date: Date) {
  return `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const jsWeekday = firstDay.getDay();
  const mondayBasedOffset = (jsWeekday + 6) % 7;
  const totalDays = lastDay.getDate();
  const days: Array<Date | null> = [];

  for (let i = 0; i < mondayBasedOffset; i += 1) {
    days.push(null);
  }
  for (let d = 1; d <= totalDays; d += 1) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function isPastCalendarDay(day: Date) {
  return toIsoDate(day) < toIsoDate(new Date());
}

export default function HomePage() {
  const heroImages = ["/FOTO_1.webp", "/FOTO_2.webp", "/FOTO_3.webp", "/FOTO_4.webp", "/FOTO_5.webp"];
  const festiveImages = ["/f1.jpg", "/f2.jpg", "/f3.jpg", "/f4.jpg", "/f5.jpg", "/f6.jpg", "/f7.jpg", "/f8.jpg"];
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"IT" | "EN">("IT");
  const langSwitcherRef = useRef<HTMLDivElement>(null);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<"pranzo" | "cena">("pranzo");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [selectedTime, setSelectedTime] = useState("19:30");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const bookingFormRef = useRef<HTMLFormElement>(null);

  const isMobileViewport = useSyncExternalStore(
    subscribeMobileNavViewport,
    getMobileNavViewport,
    () => false
  );

  useEffect(() => {
    setPortalReady(true);
  }, []);

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
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

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

  const lunchTimes = useMemo(
    () => ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
    []
  );
  const dinnerTimes = useMemo(
    () => ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
    []
  );
  const slots = timeRange === "pranzo" ? lunchTimes : dinnerTimes;
  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const activePromotions = config.promotions.filter((item) => item.active);

  useEffect(() => {
    setSelectedTime(slots[0]);
  }, [timeRange, slots]);

  const closeBookingModal = useCallback(() => {
    bookingFormRef.current?.reset();
    setBookingModalOpen(false);
  }, []);

  const openBookingModal = () => {
    const t = toIsoDate(new Date());
    if (selectedDate < t) setSelectedDate(t);
    setBookingModalOpen(true);
  };

  const handleBookingDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const nome = String(fd.get("nome") ?? "").trim();
    const cognome = String(fd.get("cognome") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const tel = String(fd.get("telefono") ?? "").trim();
    const richieste = String(fd.get("richieste") ?? "").trim() || "—";
    const servizio = timeRange === "pranzo" ? "Pranzo" : "Cena";
    const telefonoCompleto = `+39 ${tel}`;
    const text = `Ciao DELICATESSEN, vorrei prenotare un tavolo.

Data: ${selectedDate}
Servizio: ${servizio}
Orario: ${selectedTime}

Nome: ${nome}
Cognome: ${cognome}
Email: ${email}
Telefono: ${telefonoCompleto}

Richieste speciali: ${richieste}`;
    const base = config.contact.whatsappUrl;
    const join = base.includes("?") ? "&" : "?";
    window.open(`${base}${join}text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    closeBookingModal();
  };

  useEffect(() => {
    const t = toIsoDate(new Date());
    if (selectedDate < t) setSelectedDate(t);
  }, [selectedDate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (bookingModalOpen) {
        closeBookingModal();
        return;
      }
      if (mobileNavOpen) setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookingModalOpen, mobileNavOpen, closeBookingModal]);

  useEffect(() => {
    if (!bookingModalOpen && !mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [bookingModalOpen, mobileNavOpen]);

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== "undefined" && window.innerWidth > 767) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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

      <header
        className={`main-header ${headerShadow ? "scrolled" : ""}`}
      >
        <div className="container header-inner">
          <button
            type="button"
            className="home-mobile-nav-toggle"
            aria-expanded={mobileNavOpen}
            aria-controls={isMobileViewport ? "home-mobile-menu" : "home-header-actions"}
            aria-label={mobileNavOpen ? "Chiudi menu" : "Apri menu di navigazione"}
            onClick={() => {
              setLangOpen(false);
              setMobileNavOpen((o) => !o);
            }}
          >
            <i className={`fa-solid ${mobileNavOpen ? "fa-xmark" : "fa-bars"}`} aria-hidden />
          </button>
          <a className="logo" href="#home" aria-label="DELICATESSEN Home">
            <img src="/delilogo.webp" alt="Logo Delicatessen" className="logo-image" />
          </a>
          <div
            className="header-actions"
            id="home-header-actions"
            aria-hidden={isMobileViewport}
          >
            {!isMobileViewport && (
              <HomeMobileNavDrawerContent
                ref={langSwitcherRef}
                config={config}
                onCloseMobile={() => setMobileNavOpen(false)}
                langOpen={langOpen}
                setLangOpen={setLangOpen}
                activeLang={activeLang}
                setActiveLang={setActiveLang}
              />
            )}
          </div>
        </div>
      </header>

      {portalReady &&
        isMobileViewport &&
        mobileNavOpen &&
        createPortal(
          <div
            className="home-mobile-nav-portal"
            id="home-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
          >
            <HomeMobileNavDrawerContent
              ref={langSwitcherRef}
              config={config}
              onCloseMobile={() => setMobileNavOpen(false)}
              langOpen={langOpen}
              setLangOpen={setLangOpen}
              activeLang={activeLang}
              setActiveLang={setActiveLang}
            />
          </div>,
          document.body
        )}

      <main id="home">
        <section className="hero premium-hero">
          <div className="hero-media" aria-hidden>
            {heroImages.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt={`Sala Delicatessen ${idx + 1}`}
                className={`hero-slide ${idx === heroIndex ? "active" : ""}`}
              />
            ))}
          </div>
        </section>

        {activePromotions.length > 0 && (
          <section className="promotions section-dark promotions-fullwidth" aria-label="Promozioni">
            <div
              className={
                activePromotions.length === 1
                  ? "promo-split-grid promo-split-grid--one"
                  : "promo-split-grid promo-split-grid--many"
              }
            >
              {activePromotions.map((promo, index) => {
                const isLastOdd =
                  activePromotions.length > 1 &&
                  activePromotions.length % 2 === 1 &&
                  index === activePromotions.length - 1;
                const quad = promotionQuadUrls(promo);
                return (
                  <article
                    className={`promo-split-card${isLastOdd ? " promo-split-card--full" : ""}`}
                    key={promo.id}
                  >
                    <div className="promo-split-body promo-split-body--triple">
                      <div
                        className="promo-split-side promo-split-side--left"
                        role="group"
                        aria-label={`Immagini sinistra: ${promo.title}`}
                      >
                        <div className="promo-split-photo">
                          <img src={quad[0]} alt="" />
                        </div>
                        <div className="promo-split-photo">
                          <img src={quad[1]} alt="" />
                        </div>
                      </div>
                      <div className="promo-split-text">
                        <h4>{promo.title}</h4>
                        <p>{promo.description}</p>
                        <a href={promo.ctaLink} className="promo-link">
                          {promo.ctaText}
                        </a>
                      </div>
                      <div
                        className="promo-split-side promo-split-side--right"
                        role="group"
                        aria-label={`Immagini destra: ${promo.title}`}
                      >
                        <div className="promo-split-photo">
                          <img src={quad[2]} alt="" />
                        </div>
                        <div className="promo-split-photo">
                          <img src={quad[3]} alt="" />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="festive-showcase" aria-label="Galleria fotografica">
          <div className="festive-marquee-wrap" aria-label="Selezione fotografica Delicatessen">
            <div className="festive-marquee-track row-a">
              {[...festiveImages, ...festiveImages].map((src, idx) => (
                <article className="festive-marquee-card" key={`a-${src}-${idx}`}>
                  <img src={src} alt={`Creazione Delicatessen ${idx + 1}`} />
                </article>
              ))}
            </div>
            <div className="festive-marquee-track row-b">
              {[...festiveImages, ...festiveImages].map((src, idx) => (
                <article className="festive-marquee-card" key={`b-${src}-${idx}`}>
                  <img src={src} alt={`Specialita Delicatessen ${idx + 1}`} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="welcome" style={{ backgroundImage: `url(${config.welcome.image})` }}>
          <div className="welcome-overlay" />
          <div className="container welcome-content welcome-benvenuti">
            <img src="/logocervo.webp" alt="Delicatessen" className="welcome-benvenuti__logo" />
            <h2 className="welcome-benvenuti__title">Ristorante Delicatessen</h2>
            <p className="welcome-benvenuti__lead">
              da oltre dieci anni custodiamo l&apos;anima gastronomica altoatesina nel cuore di Milano, con una
              cucina che unisce tradizione, precisione tecnica e calore contemporaneo. Dall&apos;aperitivo alle cene
              su misura, ogni servizio è pensato per ospiti esigenti: menu alla carta, proposte stagionali ed eventi
              privati con un team dedicato in ogni dettaglio.
            </p>
          </div>
        </section>

        <section className="promotions section-dark promotions-fullwidth pasqua-promo" aria-label="Pranzo di Pasqua">
          <div className="promo-split-grid promo-split-grid--one">
            <article className="promo-split-card">
              <div className="promo-split-body promo-split-body--triple">
                <div
                  className="promo-split-side promo-split-side--left"
                  role="group"
                  aria-label="Immagini sinistra: Pranzo di Pasqua"
                >
                  <div className="promo-split-photo">
                    <img src={PASQUA_SPLIT_IMAGES[0]} alt="" />
                  </div>
                  <div className="promo-split-photo">
                    <img src={PASQUA_SPLIT_IMAGES[1]} alt="" />
                  </div>
                </div>
                <div className="promo-split-text">
                  <h4>PRANZO DI PASQUA</h4>
                  <p className="pasqua-promo-desc">
                    🥨🐇 ANCHE QUEST&apos;ANNO SAREMO
                    <br />
                    LIETI DI OSPITARVI PER IL PRANZO DI
                    <br />
                    PASQUA DOMENICA 5 APRILE CON
                    <br />
                    MENÙ ALLA CARTA!
                  </p>
                  <a href={config.links.booking} className="promo-link">
                    PRENOTA ORA
                  </a>
                </div>
                <div
                  className="promo-split-side promo-split-side--right"
                  role="group"
                  aria-label="Immagini destra: Pranzo di Pasqua"
                >
                  <div className="promo-split-photo">
                    <img src={PASQUA_SPLIT_IMAGES[2]} alt="" />
                  </div>
                  <div className="promo-split-photo">
                    <img src={PASQUA_SPLIT_IMAGES[3]} alt="" />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          className="news section-dark news-momenti-full"
          aria-label="Momenti fotografici Delicatessen"
        >
          {config.newsItems.length > 0 && (
            <div className="news-marquee-wrap">
              <div className="news-marquee-track">
                <div className="news-marquee-group">
                  {config.newsItems.map((item) => (
                    <article
                      key={`momenti-g1-${item.image}`}
                      className={`news-marquee-card dish-card${item.highlight ? " highlight" : ""}`}
                    >
                      <img src={item.image} alt={item.title} />
                      <div className="news-marquee-overlay">
                        <h4>{item.title}</h4>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="news-marquee-group" aria-hidden>
                  {config.newsItems.map((item) => (
                    <article
                      key={`momenti-g2-${item.image}`}
                      className={`news-marquee-card dish-card${item.highlight ? " highlight" : ""}`}
                    >
                      <img src={item.image} alt="" />
                      <div className="news-marquee-overlay">
                        <h4>{item.title}</h4>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Ancoraggio #menu: link header "Il Menu" (sezione piatti rimossa) */}
        <div id="menu" className="menu-scroll-anchor" aria-hidden="true" />

        <section id="prenota" className="experience" aria-labelledby="prenota-heading">
          <div className="container experience-grid">
            <form
              className="reservation-card calendar-card"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="calendar-card-intro">
                <h2 id="prenota-heading">{config.experience.subtitle}</h2>
                <p>
                  Scegli giorno, pranzo o cena e l&apos;orario. Con <strong>Conferma prenotazione</strong> apri il
                  modulo con i tuoi dati; con <strong>Prenota ora</strong> invii tutto su WhatsApp.
                </p>
              </div>
              <div className="calendar-head">
                <button
                  type="button"
                  aria-label="Mese precedente"
                  onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <h5>{monthTitle(viewDate)}</h5>
                <button
                  type="button"
                  aria-label="Mese successivo"
                  onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>

              <div className="calendar-weekdays">
                {weekdayLabels.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarDays.map((day, idx) =>
                  day ? (
                    <button
                      key={`${toIsoDate(day)}-${idx}`}
                      type="button"
                      disabled={isPastCalendarDay(day)}
                      className={[
                        selectedDate === toIsoDate(day) ? "active" : "",
                        isPastCalendarDay(day) ? "is-past" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSelectedDate(toIsoDate(day))}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span key={`empty-${idx}`} className="empty" />
                  )
                )}
              </div>

              <div className="service-tabs">
                <button
                  type="button"
                  className={timeRange === "pranzo" ? "active" : ""}
                  onClick={() => setTimeRange("pranzo")}
                >
                  Pranzo
                </button>
                <button
                  type="button"
                  className={timeRange === "cena" ? "active" : ""}
                  onClick={() => setTimeRange("cena")}
                >
                  Cena
                </button>
              </div>

              <div className="time-slots">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={selectedTime === slot ? "active" : ""}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="booking-summary">
                <span>
                  <i className="fa-regular fa-calendar" /> {selectedDate}
                </span>
                <span>
                  <i className="fa-regular fa-clock" /> {selectedTime}
                </span>
              </div>

              <button type="button" className="btn-primary" onClick={openBookingModal}>
                Conferma prenotazione
              </button>
            </form>
          </div>
        </section>

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
      </main>

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

      <a className="whatsapp-floating" href="/#prenota" aria-label="Prenota — apri il calendario">
        <i className="fa-brands fa-whatsapp" aria-hidden />
        Prenota
      </a>

      {bookingModalOpen ? (
        <div
          className="booking-modal-backdrop"
          role="presentation"
          onClick={closeBookingModal}
        >
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-modal-head">
              <h3 id="booking-modal-title">Conferma prenotazione</h3>
              <button
                type="button"
                className="booking-modal-close"
                onClick={closeBookingModal}
                aria-label="Chiudi"
              >
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
            </div>
            <p className="booking-modal-recap">
              <span>
                {selectedDate} · {timeRange === "pranzo" ? "Pranzo" : "Cena"} · {selectedTime}
              </span>
            </p>
            <form ref={bookingFormRef} className="booking-detail-form" onSubmit={handleBookingDetailsSubmit}>
              <div className="booking-form-row booking-form-row--2">
                <div className="booking-field">
                  <label htmlFor="booking-nome">Nome *</label>
                  <input
                    id="booking-nome"
                    name="nome"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Alessia"
                    required
                  />
                </div>
                <div className="booking-field">
                  <label htmlFor="booking-cognome">Cognome *</label>
                  <input
                    id="booking-cognome"
                    name="cognome"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Marine"
                    required
                  />
                </div>
              </div>
              <div className="booking-field booking-field--full">
                <label htmlFor="booking-email">E-mail *</label>
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alessia@marine.com"
                  required
                />
                <span className="booking-field-hint">Email</span>
              </div>
              <div className="booking-field booking-field--full">
                <label htmlFor="booking-telefono">Telefono *</label>
                <div className="booking-phone-wrap">
                  <span className="booking-phone-prefix" aria-hidden>
                    <span className="booking-phone-flag" title="Italia">
                      <FlagItaly className="booking-phone-flag-svg" />
                    </span>
                    +39
                  </span>
                  <input
                    id="booking-telefono"
                    name="telefono"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="3333333333"
                    pattern="[0-9]{8,12}"
                    title="Inserisci il numero senza prefisso (8–12 cifre)"
                    required
                  />
                </div>
                <span className="booking-field-hint booking-field-hint--split">
                  <span>Italy</span>
                  <span>Telefono</span>
                </span>
              </div>
              <div className="booking-field booking-field--full">
                <label htmlFor="booking-richieste">Richieste speciali</label>
                <textarea
                  id="booking-richieste"
                  name="richieste"
                  rows={4}
                  placeholder="Richieste speciali"
                />
                <span className="booking-field-hint">
                  es. Allergie, cani, sediolone, compleanno
                </span>
              </div>
              <div className="booking-field booking-field--checkbox">
                <label className="booking-checkbox-label">
                  <input type="checkbox" name="termini" required />
                  <span>
                    Sono d&apos;accordo con i{" "}
                    <a href={config.links.privacyPolicy} target="_blank" rel="noreferrer">
                      Termini e Condizioni
                    </a>{" "}
                    *
                  </span>
                </label>
                <span className="booking-field-hint">Termini e Condizioni</span>
              </div>
              <div className="booking-modal-actions">
                <button type="button" className="booking-btn-secondary" onClick={closeBookingModal}>
                  Annulla
                </button>
                <button type="submit" className="booking-btn-whatsapp">
                  <i className="fa-brands fa-whatsapp" aria-hidden />
                  Prenota ora
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </>
  );
}
