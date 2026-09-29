import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jennings Media",
    short_name: "Jennings",
    description: "Premium real estate photography, video, drone and 3D tours.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#07080a",
    theme_color: "#07080a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
