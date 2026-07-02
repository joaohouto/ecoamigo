import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ECO AMIGO — Pantanal Tech",
    short_name: "ECO AMIGO",
    description: "Juntos por um mundo mais verde!",
    start_url: "/",
    display: "fullscreen",
    orientation: "any",
    background_color: "#F5F5E8",
    theme_color: "#2D7D2D",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
