import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Misión Geneo — Convertite en Especialista",
  description:
    "Programa de formación gamificado para Farmacias Aliadas Geneo. Aprendé jugando, sumá puntos y obtené tu certificado de Especialista Beauty Wellness.",
  // Programa interno para farmacias aliadas: no se indexa.
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Misión Geneo",
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
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
