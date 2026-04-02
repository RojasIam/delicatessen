/** SVG bandiere (Windows non mostra le emoji regionali). */
export function FlagItaly({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 3 2" aria-hidden>
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#fff" />
      <rect x="2" width="1" height="2" fill="#ce2b37" />
    </svg>
  );
}

export function FlagUk({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden>
      <rect width="60" height="30" fill="#012169" />
      <path stroke="#fff" strokeWidth="6" d="M0,0 60,30 M60,0 0,30" />
      <path stroke="#c8102e" strokeWidth="4" d="M0,0 60,30 M60,0 0,30" />
      <path stroke="#fff" strokeWidth="10" d="M30,0v30M0,15h60" />
      <path stroke="#c8102e" strokeWidth="6" d="M30,0v30M0,15h60" />
    </svg>
  );
}
