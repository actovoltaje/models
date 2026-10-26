import type { Metadata } from "next";
import { Seal } from "@/components/brand/Seal";
import { BUBBLE, Lockup, Mark, PULSE } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Marca · Latente",
  description: "Guía de la marca Latente: idea, logotipo, color, tipografía y tono.",
  robots: { index: false, follow: false },
};

const DOWNLOADS: ReadonlyArray<readonly [string, string]> = [
  ["Logotipo a color", "/brand/latente-lockup.svg"],
  ["Logotipo en una tinta", "/brand/latente-lockup-mono.svg"],
  ["Logotipo para fondo oscuro", "/brand/latente-lockup-reverse.svg"],
  ["Símbolo a color", "/brand/latente-mark.svg"],
  ["Símbolo en una tinta", "/brand/latente-mark-mono.svg"],
  ["Símbolo para fondo oscuro", "/brand/latente-mark-reverse.svg"],
  ["Icono de aplicación", "/brand/latente-app-icon.svg"],
];

const SAY: ReadonlyArray<readonly [string, string]> = [
  ["Te decimos si la IA te recomienda", "Medimos tu visibilidad generativa (GEO)"],
  ["Tu nota es 41 de 100", "Tu score de presencia en LLM es 0,41"],
  ["Quién sale en tu lugar", "Análisis de share of voice competitivo"],
  ["Que hablen bien de ti", "Optimiza tu posicionamiento en IA"],
];

export default function Marca() {
  return (
    <main className="brand">
      <header className="brand-cover">
        <Lockup height={72} title="Latente" />
        <p className="brand-tagline">Que la IA hable bien de ti.</p>
      </header>

      <section className="brand-sec brand-idea">
        <div>
          <h2>Antes te recomendaba el vecino. Ahora te recomienda la IA.</h2>
          <p className="muted-lg">
            Una pyme vive del boca a boca. Hoy el boca a boca también pasa por ChatGPT, Gemini y Perplexity, y casi nadie sabe qué dicen de su negocio. Latente se lo cuenta con una nota y en lenguaje de tienda, no de laboratorio.
          </p>
        </div>
        <ul className="brand-meaning">
          <li><strong>La burbuja</strong> es la conversación: alguien pregunta y te mencionan o no. Su esquina cuadrada es la «L» de Latente.</li>
          <li><strong>El latido</strong> es el Pulso: lo que medimos, siempre en cobalto, siempre vivo.</li>
          <li><strong>El nombre</strong> ya lo dice: «late» es «él late». El latido también sube por la barra de la primera «t».</li>
        </ul>
      </section>

      <section className="brand-sec brand-construct">
        <h2>Cómo está construido</h2>
        <svg viewBox="0 0 600 260" role="img" aria-label="Construcción del símbolo" className="construct">
          <g transform="translate(170 10) scale(2.4)">
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--rule)" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--rule)" strokeDasharray="2 2" />
            <line x1="0" y1="52" x2="100" y2="52" stroke="var(--rule)" strokeDasharray="2 2" />
            <path d={BUBBLE} fill="none" stroke="var(--ink)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
            <path d={PULSE} fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
          </g>
          <g fontSize="11" fill="var(--muted)">
            <text x="424" y="150">línea del latido</text>
            <text x="424" y="164">al 52 % de la altura</text>
            <text x="4" y="40">círculo de radio 38</text>
            <text x="4" y="54">sobre un lienzo de 100</text>
            <text x="4" y="236">una sola esquina</text>
            <text x="4" y="250">cuadrada, abajo a la izquierda</text>
          </g>
        </svg>
        <p className="muted">Trazo de 8 con extremos y uniones redondeados: amable, de rotulista, no de ingeniería.</p>
      </section>

      <section className="brand-sec">
        <h2>Versiones</h2>
        <div className="variants">
          <figure className="v v-light"><Lockup height={52} title="Logotipo" /><figcaption>A color, sobre claro</figcaption></figure>
          <figure className="v v-dark" data-theme="dark"><Lockup height={52} title="Logotipo" /><figcaption>Sobre oscuro</figcaption></figure>
          <figure className="v v-mono"><img src="/brand/latente-mark-mono.svg" alt="" height={64} /><figcaption>Una tinta, para sellos y fax</figcaption></figure>
          <figure className="v v-app"><img src="/brand/latente-app-icon.svg" alt="" height={72} /><figcaption>Icono de aplicación</figcaption></figure>
        </div>
        <p className="muted">Espacio libre alrededor: el ancho del trazo del latido multiplicado por 4. Tamaño mínimo: símbolo 20 px, logotipo 96 px de ancho.</p>
      </section>

      <section className="brand-sec">
        <h2>Color y tipografía</h2>
        <div className="swatches">
          <div style={{ background: "#eef1f3", color: "#101418" }}><b>Papel</b><span>#EEF1F3</span><small>Fondo, 60 %</small></div>
          <div style={{ background: "#101418", color: "#eef1f3" }}><b>Tinta</b><span>#101418</span><small>Texto y contorno, 30 %</small></div>
          <div style={{ background: "#2a3fd1", color: "#fff" }}><b>Cobalto</b><span>#2A3FD1</span><small>El latido y los botones, 10 %</small></div>
          <div style={{ background: "#8c9dff", color: "#101418" }}><b>Cobalto claro</b><span>#8C9DFF</span><small>El mismo latido en modo oscuro</small></div>
        </div>
        <div className="type">
          <p className="type-big">Geist 600</p>
          <p className="muted-lg">Para titulares y números, con el espaciado algo cerrado. Cuerpo en Geist 400. Nada de serif: queremos parecer una herramienta de confianza, no un periódico.</p>
        </div>
      </section>

      <section className="brand-sec">
        <h2>Cómo hablamos</h2>
        <p className="muted-lg">Hablamos como habla el dueño de una tienda con otro dueño de una tienda. Cero siglas.</p>
        <div className="say">
          <div><h3>Decimos</h3>{SAY.map(([a]) => <p key={a}>{a}</p>)}</div>
          <div className="say-no"><h3>No decimos</h3>{SAY.map(([, b]) => <p key={b}>{b}</p>)}</div>
        </div>
      </section>

      <section className="brand-sec brand-apps">
        <div>
          <h2>El sello para el escaparate</h2>
          <p className="muted-lg">Quien mide su Pulso se lleva un sello con su nota, para la puerta del local, la firma del correo o la web. Cada sello lleva a su vez el nombre de Latente a un sitio donde la gente mira.</p>
          <p className="muted">Ejemplo con datos inventados. En el producto, el número es el del último escaneo.</p>
        </div>
        <div className="seals">
          <Seal score={72} id="s72" />
          <Seal score={41} id="s41" />
        </div>
      </section>

      <section className="brand-sec">
        <h2>Descargas</h2>
        <ul className="downloads">
          {DOWNLOADS.map(([name, href]) => (
            <li key={href}><a href={href} download>{name}</a><span className="muted">SVG</span></li>
          ))}
        </ul>
        <p className="muted">El símbolo suelto <Mark size={14} title="" /> se usa solo cuando el nombre ya aparece cerca.</p>
      </section>
    </main>
  );
}
