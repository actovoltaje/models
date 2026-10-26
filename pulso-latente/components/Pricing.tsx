import { copy } from "@/lib/copy";

export function Pricing() {
  const [free, ...paid] = copy.plans;
  return (
    <section className="section" id="planes" aria-labelledby="planes-h">
      <h2 id="planes-h">Del escáner al seguimiento</h2>
      <div className="plans">
        {free && (
          <article className="plan-main">
            <h3>{free.name}</h3>
            <p className="price">{free.price}</p>
            <ul>{free.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </article>
        )}
        <ul className="plan-rows">
          {paid.map((p) => (
            <li key={p.name}>
              <div>
                <h3>{p.name}</h3>
                <p className="muted">{p.points.join(". ")}.</p>
              </div>
              <p className="price-sm">{p.price}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="muted">{copy.plansNote}</p>
    </section>
  );
}
