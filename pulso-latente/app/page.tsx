import { Lockup } from "@/components/Logo";
import { Pricing } from "@/components/Pricing";
import { Scanner } from "@/components/Scanner";
import { copy } from "@/lib/copy";

export default function Page() {
  return (
    <>
      <header className="top">
        <a className="logo" href="/" aria-label="Latente, inicio"><Lockup height={30} title="" /></a>
        <a href="#planes">Planes</a>
      </header>
      <main>
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <h1>{copy.hero.title}</h1>
            <p className="lead">{copy.hero.lead}</p>
            <svg className="pulse" viewBox="0 0 240 40" aria-hidden="true">
              <path d="M0 20 H92 L100 4 L112 36 L118 20 H240" />
            </svg>
          </div>
          <Scanner />
        </section>

        <section className="section" aria-labelledby="como-h">
          <h2 id="como-h">Cómo funciona</h2>
          <ol className="steps">
            {copy.steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <Pricing />
      </main>
      <footer className="foot">{copy.footer}</footer>
    </>
  );
}
