import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MedCheck — fact-checked answers for med students",
    short_name: "MedCheck",
    description:
      "Grounded, cited answers to clinical and lab questions for medical students — or an honest 'not covered yet'.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e14",
    theme_color: "#0d7d6b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
