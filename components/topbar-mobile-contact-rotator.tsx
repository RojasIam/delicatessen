"use client";

/**
 * Alternanza telefono / email solo con CSS (@keyframes), senza setInterval:
 * evita matchMedia / throttling / Strict Mode che lasciavano fermo il testo sul numero.
 */
type Props = {
  phoneHref: string;
  phoneLabel: string;
  emailHref: string;
  emailLabel: string;
};

export function TopbarMobileContactRotator({ phoneHref, phoneLabel, emailHref, emailLabel }: Props) {
  return (
    <div className="topbar-mobile-contact-rotator" aria-label="Contatti: telefono e email in rotazione">
      <a href={phoneHref} className="topbar-mobile-contact-rotator__link topbar-mobile-contact-rotator__link--phone">
        <i className="fa-solid fa-phone" aria-hidden />
        <span className="topbar-mobile-contact-rotator__text">{phoneLabel}</span>
      </a>
      <a href={emailHref} className="topbar-mobile-contact-rotator__link topbar-mobile-contact-rotator__link--email">
        <i className="fa-solid fa-envelope" aria-hidden />
        <span className="topbar-mobile-contact-rotator__text">{emailLabel}</span>
      </a>
    </div>
  );
}
