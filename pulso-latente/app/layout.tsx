import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latente · ¿Te recomienda la IA?",
  description: "Mide gratis si ChatGPT, Gemini y Perplexity te recomiendan, quién sale en tu lugar y qué hacer para cambiarlo.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4efe6" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
