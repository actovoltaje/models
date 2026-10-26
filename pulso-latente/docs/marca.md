# Marca Latente

Guía visual viva en `/marca` (página interna, sin indexar). Archivos descargables en `public/brand/`.
Latente es una marca de la división /NEXT GEN de Acto Voltaje y usa su identidad: paleta y tipografías de la ficha «Acto Voltaje, Contexto operativo y precios» en Notion.

- **Idea:** la IA es el nuevo boca a boca. Burbuja de conversación (te mencionan) con un latido dentro (el Pulso). Esquina cuadrada abajo a la izquierda = la «L».
- **Nombre:** «late» es «él late»; el latido sube por la barra de la primera «t» del logotipo.
- **Frase de marca:** «Que la IA hable bien de ti.» Texto pequeño de la home: «El boca a boca de la IA».
- **Color (Acto Voltaje):** ámbar `#FFB700` (protagonista: burbuja, banda de inicio, plan gratuito), navy `#093160` (texto, contorno, botones), cian `#0F92B2` (solo apoyo: foco del teclado), papel `#F4F7FA`. Texto sobre ámbar siempre navy (contraste 7:1); el ámbar solo no contrasta con el papel, por eso los gráficos usan `--signal` (navy en claro, ámbar en oscuro).
- **Tipografía (Acto Voltaje):** Maven Pro (titulares y texto) y Space Mono (números: nota, precios). Autoalojadas con `@fontsource`.
- **Tono:** de dueño de tienda a dueño de tienda, sin siglas (nada de GEO, LLM, share of voice).
- **Componentes:** `components/Logo.tsx` (`Mark`, `Lockup`), `components/brand/Seal.tsx` (Sello Latente con la nota). Los tokens están en `app/globals.css`.
- **Regenerar el logotipo:** el contorno sale de Maven Pro Bold (`opentype.js`); la «t» lleva el astil cortado a la altura de la barra y un trazo ámbar con filo navy encima. Si cambia la tipografía hay que volver a generar `WORD` y `WORD_PULSE` en `Logo.tsx` y los SVG de `public/brand/`.
- **Iconos:** `app/icon.svg`, `app/apple-icon.png` (180 px) y `app/opengraph-image.png` (1200x630).

Pendiente: mostrar el Sello en el resultado del escaneo (descargable con la nota real) y versión PNG de la tarjeta compartible para LinkedIn.
