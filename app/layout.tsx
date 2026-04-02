import type { Metadata } from "next";
import { GsapProvider } from "./gsap-provider";
import "./globals.css";
import "./booking-modal.css";

export const metadata: Metadata = {
  title: "DELICATESSEN | Ristorante Italiano Elegante",
  description:
    "DELICATESSEN Milano - Cucina italiana elegante, atmosfera alpina raffinata e prenotazioni rapide."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/logocervo.webp" type="image/webp" sizes="any" />
        <link rel="apple-touch-icon" href="/logocervo.webp" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Cormorant+Garamond:wght@500;600&family=Roboto:wght@400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <GsapProvider>{children}</GsapProvider>
      </body>
    </html>
  );
}
