# Marca Latente

Guía visual viva en `/marca` (página interna, sin indexar). Archivos descargables en `public/brand/`.

- **Idea:** la IA es el nuevo boca a boca. Burbuja de conversación (te mencionan) con un latido dentro (el Pulso). Esquina cuadrada abajo a la izquierda = la «L».
- **Nombre:** «late» es «él late»; el latido sube por la barra de la primera «t» del logotipo.
- **Tagline:** «Que la IA hable bien de ti.» Eyebrow de la home: «El boca a boca de la IA».
- **Color:** papel `#EEF1F3`, tinta `#101418`, cobalto `#2A3FD1` (modo oscuro: `#8C9DFF`). Un solo acento.
- **Tipografía:** Geist 600 (titulares y números) y Geist 400 (cuerpo). Sin serif.
- **Tono:** de dueño de tienda a dueño de tienda, sin siglas (nada de GEO, LLM, share of voice).
- **Componentes:** `components/Logo.tsx` (`Mark`, `Lockup`, usan `--ink` y `--accent`), `components/brand/Seal.tsx` (Sello Latente con la nota).
- **Regenerar el logotipo:** el contorno sale de Geist Bold con `opentype.js`; la «t» lleva el astil cortado a la altura de la barra y un trazo cobalto encima. Si cambia la tipografía, hay que volver a generar `WORD` y `WORD_PULSE` en `Logo.tsx` y los SVG de `public/brand/`.
- **Iconos:** `app/icon.svg`, `app/apple-icon.png` (180 px) y `app/opengraph-image.png` (1200x630).

Pendiente: mostrar el Sello en el resultado del escaneo (descargable con la nota real) y versión PNG de la tarjeta compartible para LinkedIn.
