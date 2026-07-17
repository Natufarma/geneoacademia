import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Misión Geneo",
    short_name: "Misión Geneo",
    description:
      "Programa de formación gamificado para Farmacias Aliadas Geneo.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFAFB",
    theme_color: "#E6005C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
