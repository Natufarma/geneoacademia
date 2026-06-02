import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import Intro from "@/components/Intro";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "suplementos de belleza",
    "colágeno hidrolizado",
    "coenzima Q10",
    "ácido hialurónico",
    "resveratrol",
    "belleza desde adentro",
    "Geneo",
    "Natufarma",
  ],
  authors: [{ name: "Natufarma" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/img/isotipo.png", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Geneo",
    title: "Geneo — La belleza empieza adentro y se celebra afuera",
    description:
      "Suplementos de belleza con colágeno, Q10 y más. Resultados que se ven, confianza que se siente.",
    images: [
      {
        url: "/img/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Geneo — suplementos de belleza por Natufarma",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Geneo — La belleza empieza adentro",
    description:
      "Suplementos de belleza con colágeno, Q10 y ácido hialurónico. Nutrí tu piel desde adentro. Por Natufarma.",
    images: ["/img/og-cover.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#E6005C",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-geneo focus:shadow-card"
        >
          Ir al contenido principal
        </a>
        <JsonLd />
        <Intro />
        <ScrollProgress />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
