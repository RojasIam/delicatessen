import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  /**
   * Next 15 activa por defecto el "segment explorer" de DevTools; con React 19 en Windows suele romper el
   * Flight/RSC (SegmentViewNode missing en el manifest, pantalla en blanco). Desactivarlo no afecta al sitio en prod.
   */
  experimental: {
    devtoolSegmentExplorer: false
  },
  /**
   * NO desactivar `config.cache` en dev: en Windows suele provocar chunks huérfanos (Cannot find module './331.js')
   * y prerender-manifest faltante. Si HMR falla, `npm run clean` y reinicia dev.
   * Si el guardado no dispara recarga: `npm run dev:poll` (WATCHPACK_POLLING).
   */
  webpack: (config) => {
    if (process.env.WATCHPACK_POLLING === "1") {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  }
};

export default nextConfig;
