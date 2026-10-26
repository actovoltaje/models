import { BUBBLE, NAVY, PULSE } from "@/components/Logo";

/**
 * Sello Latente: pegatina para escaparate, tarjeta o web. El número es el Pulso medido.
 * El texto circular va por textPath; el id evita choques si hay varios sellos en la página.
 */
export function Seal({ score, id = "seal" }: { score: number; id?: string }) {
  const line = { fill: "none", stroke: NAVY, strokeWidth: 8, strokeLinejoin: "round", strokeLinecap: "round" } as const;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Sello Latente: Pulso ${score} sobre 100`} className="seal">
      <circle cx="100" cy="100" r="96" fill="#FFB700" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={NAVY} strokeWidth="1.5" opacity="0.5" />
      <defs>
        <path id={`${id}-arc`} d="M100 100 m-73 0 a73 73 0 1 1 146 0 a73 73 0 1 1 -146 0" />
      </defs>
      <text fontSize="14" fontWeight="700" letterSpacing="4.2" fill={NAVY}>
        <textPath href={`#${id}-arc`}>MEDIDO CON LATENTE   PULSO LATENTE   </textPath>
      </text>
      <g transform="translate(83 48) scale(0.34)">
        <path d={BUBBLE} style={line} />
        <path d={PULSE} style={line} />
      </g>
      <text x="100" y="122" textAnchor="middle" fontSize="54" fontWeight="700" letterSpacing="-2" fill={NAVY} style={{ fontFamily: "var(--mono)" }}>{score}</text>
      <text x="100" y="144" textAnchor="middle" fontSize="13" fill={NAVY} style={{ fontFamily: "var(--mono)" }}>de 100</text>
    </svg>
  );
}
