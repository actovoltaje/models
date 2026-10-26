import { copy } from "@/lib/copy";

export function Pricing() {
  return (
    <section className="section" id="planes" aria-labelledby="planes-h">
      <h2 id="planes-h">Del escáner al seguimiento</h2>
      <div className="plans">
        {copy.plans.map((p) => (
          <article key={p.name} className="plan">
            <h3>{p.name}</h3>
            <p className="price">{p.price}</p>
            <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
            {p.cta && <span className="soon">Pronto</span>}
          </article>
        ))}
      </div>
      <p className="muted">{copy.plansNote}</p>
    </section>
  );
}
