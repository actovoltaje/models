import "@fontsource/maven-pro/400.css";
import "@fontsource/maven-pro/600.css";
import "@fontsource/maven-pro/700.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latente · ¿Te recomienda la IA?",
  description: "Mide gratis si ChatGPT, Gemini y Perplexity te recomiendan, quién sale en tu lugar y qué hacer para cambiarlo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#071B33" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
