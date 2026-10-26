/** Todo el texto de marca en un sitio. Nombres canónicos: Latente, Pulso Latente, Acto Voltaje. */
export const copy = {
  brand: "Latente",
  index: "Pulso Latente",
  maker: "Acto Voltaje",
  hero: {
    eyebrow: "Visibilidad en buscadores de IA",
    title: "¿ChatGPT te recomienda a ti o a tu competencia?",
    lead: "En dos minutos sabrás si la IA te recomienda, quién sale en tu lugar y qué hacer para cambiarlo.",
  },
  form: {
    url: "Tu web",
    urlPlaceholder: "clinicasol.es",
    sector: "Qué vendes",
    sectorPlaceholder: "clínica de fisioterapia",
    city: "Dónde",
    cityPlaceholder: "Granada",
    submit: "Medir mi Pulso",
    loading: "Preguntando a ChatGPT, Gemini y Perplexity… suele tardar menos de un minuto.",
  },
  errors: {
    invalid: "Revisa los datos: la web debe ser una dirección válida y sector y ciudad solo admiten letras, números y signos básicos (máximo 6 palabras).",
    ownDomain: "Usa la web de tu negocio. No podemos medir un perfil de Instagram, Facebook u otra red social.",
    capacity: "El escáner gratuito ha llegado al límite de hoy. Vuelve mañana.",
    rate: "Has hecho varios escaneos seguidos. Vuelve a intentarlo en una hora.",
    engines: "Los buscadores de IA no han respondido. Inténtalo de nuevo en unos minutos.",
    generic: "Algo ha fallado de nuestro lado. Inténtalo de nuevo.",
  },
  result: {
    partial: "Algún buscador no ha respondido; la nota usa solo los que sí.",
    simulated: "Demostración con datos simulados: aún no hay claves de los buscadores conectadas.",
    caveat:
      "El Pulso mide una tendencia con las respuestas de las API oficiales; no es exactamente lo que ve cada usuario en su ChatGPT, que tiene memoria y personalización. Es orientativo.",
    leadTitle: "Informe completo y seguimiento",
    leadBody: "Déjanos tu email y te enviamos el informe completo y las alertas en cuanto abramos el seguimiento.",
    leadSubmit: "Apuntarme",
    consent: "Acepto que Acto Voltaje use mi email para enviarme el informe y avisos de Latente. Puedo pedir que lo borren cuando quiera.",
    leadDone: "Hecho. Te escribiremos en cuanto abramos el seguimiento.",
    card: "Descargar tarjeta para compartir",
  },
  steps: [
    { title: "Preguntamos como un cliente", body: "Diez preguntas reales sobre lo que vendes en tu ciudad." },
    { title: "Consultamos a tres IA", body: "ChatGPT, Gemini y Perplexity, por sus API oficiales y varias veces cada una." },
    { title: "Te damos la nota", body: "Un Pulso de 0 a 100, los tres competidores que más salen y tres acciones." },
  ],
  plans: [
    { name: "Escáner", price: "Gratis", points: ["1 marca, 10 preguntas, 3 motores", "Una sola vez", "Tarjeta compartible"], cta: false },
    { name: "Radar", price: "19 €/mes", points: ["1 marca, 25 preguntas", "Mensual y control semanal", "Histórico y alertas de caída"], cta: true },
    { name: "Pulso", price: "49 €/mes", points: ["1 marca, 50 preguntas, 4 motores", "Semanal", "5 competidores e informe mensual en PDF"], cta: true },
    { name: "Agencia", price: "149 €/mes", points: ["10 marcas, 50 preguntas por marca", "Semanal", "Marca blanca para tus clientes"], cta: true },
  ],
  plansNote: "Precios de partida, se validan con los primeros escaneos. Los planes de pago abren pronto.",
  footer: "Un producto de Acto Voltaje.",
  bands: [
    { max: 29, label: "Casi invisible" },
    { max: 59, label: "Presencia débil" },
    { max: 79, label: "Te recomiendan a veces" },
    { max: 100, label: "Referente" },
  ],
} as const;

export function bandFor(score: number): string {
  return copy.bands.find((b) => score <= b.max)?.label ?? copy.bands[3].label;
}
