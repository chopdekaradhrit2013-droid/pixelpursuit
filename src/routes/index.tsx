import { createFileRoute } from "@tanstack/react-router";
import { PixelPursuit } from "@/components/PixelPursuit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Pursuit" },
      { name: "description", content: "Survive the jungle. Recover the beacons. Outrun the predator." },
      { property: "og:title", content: "Pixel Pursuit" },
      { property: "og:description", content: "A seamless day and night hunt across a tiled jungle world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PixelPursuit,
});
