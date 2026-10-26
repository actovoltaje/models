import { BUBBLE, PULSE } from "@/components/Logo";

/**
 * Sello Latente: pegatina para escaparate, tarjeta o web. El número es el Pulso medido.
 * El texto circular va por textPath; el id evita choques si hay varios sellos en la página.
 */
export function Seal({ score, id = "seal" }: { score: number; id?: string }) {
  const line = { fill: "none", stroke: "var(--accent-ink)", strokeWidth: 8, strokeLinejoin: "round", strokeLinecap: "round" } as const;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Sello Latente: Pulso ${score} sobre 100`} className="seal">
      <circle cx="100" cy="100" r="96" fill="var(--accent)" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="var(--accent-ink)" strokeWidth="1.5" opacity="0.45" />
      <defs>
        <path id={`${id}-arc`} d="M100 100 m-73 0 a73 73 0 1 1 146 0 a73 73 0 1 1 -146 0" />
      </defs>
      <text fontSize="14" fontWeight="600" letterSpacing="4.2" fill="var(--accent-ink)">
        <textPath href={`#${id}-arc`}>MEDIDO CON LATENTE   PULSO LATENTE   </textPath>
      </text>
      <g transform="translate(83 48) scale(0.34)">
        <path d={BUBBLE} style={line} />
        <path d={PULSE} style={line} />
      </g>
      <text x="100" y="122" textAnchor="middle" fontSize="58" fontWeight="600" letterSpacing="-2" fill="var(--accent-ink)">{score}</text>
      <text x="100" y="144" textAnchor="middle" fontSize="13" fill="var(--accent-ink)" opacity="0.85">de 100</text>
    </svg>
  );
}
