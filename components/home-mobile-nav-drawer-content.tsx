"use client";

import { forwardRef, type Dispatch, type SetStateAction } from "react";
import type { SiteConfig } from "@/lib/site-config";
import { FlagItaly, FlagUk } from "@/components/lang-flags";

export type HomeMobileNavDrawerContentProps = {
  config: SiteConfig;
  onCloseMobile: () => void;
  langOpen: boolean;
  setLangOpen: Dispatch<SetStateAction<boolean>>;
  activeLang: "IT" | "EN";
  setActiveLang: Dispatch<SetStateAction<"IT" | "EN">>;
};

export const HomeMobileNavDrawerContent = forwardRef<HTMLDivElement, HomeMobileNavDrawerContentProps>(
  function HomeMobileNavDrawerContent(
    { config, onCloseMobile, langOpen, setLangOpen, activeLang, setActiveLang },
    ref
  ) {
    return (
      <>
        <button
          type="button"
          className="mobile-nav-backdrop"
          tabIndex={-1}
          aria-hidden
          onClick={onCloseMobile}
        />
        <nav className="main-nav" aria-label="Navigazione principale">
          <a
            href="/vini.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCloseMobile}
          >
            Carta dei Vini
          </a>
          <a href={config.links.booking} onClick={onCloseMobile}>
            Prenota
          </a>
          <a href="/shop" onClick={onCloseMobile}>
            Shop
          </a>
        </nav>
        <div className="lang-switcher lang-switcher--header" ref={ref}>
          <button
            type="button"
            onClick={() => setLangOpen((prev) => !prev)}
            aria-expanded={langOpen}
            aria-haspopup="menu"
            aria-label={
              activeLang === "IT"
                ? "Lingua: italiano. Apri menu lingue"
                : "Language: English. Open language menu"
            }
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
                  onCloseMobile();
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
                  onCloseMobile();
                }}
              >
                <span className="lang-flag-slot" aria-hidden>
                  <FlagItaly className="lang-flag-svg" />
                </span>
              </button>
            </div>
          )}
        </div>
      </>
    );
  }
);
