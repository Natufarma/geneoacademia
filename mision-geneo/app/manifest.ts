import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Misión Geneo",
    short_name: "Misión Geneo",
    description:
      "Programa de formación gamificado para Farmacias Aliadas Geneo.",
    lang: "es-AR",
    categories: ["education", "medical", "business"],
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FCFAFB",
    theme_color: "#E6005C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
