import { Reveal } from "./reveal";

const QUESTIONS = [
  {
    question: "¿Premium de verdad es un solo pago?",
    answer:
      "Sí. Pagas 10 USD una vez y conservas Premium mientras exista tu cuenta. No hay renovaciones ni cobros mensuales.",
  },
  {
    question: "¿Puedo cambiar mi nombre de usuario?",
    answer: "Sí, desde Ajustes. Tu enlace anterior queda libre para otra persona después de 14 días.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Tarjetas de crédito y débito, y métodos de pago locales según tu país.",
  },
  {
    question: "¿Sirve para mi negocio?",
    answer:
      "Claro. Puedes mostrar tu sitio web, tu agenda, tu catálogo y tus datos de contacto con un estilo sobrio.",
  },
];

/** Figma 5:263 "Preguntas". */
export function Faq() {
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="mx-auto grid max-w-[1440px] scroll-mt-24 gap-8 px-4 pt-10 pb-20 sm:px-8 lg:grid-cols-[420px_1fr] lg:gap-20 lg:px-20 lg:pt-[60px] lg:pb-[110px]"
    >
      <Reveal>
        <h2 id="preguntas-title" className="text-4xl leading-[1.05] font-bold tracking-[-0.025em] sm:text-[50px]">
          Preguntas
          <br className="hidden lg:block" /> frecuentes
        </h2>
      </Reveal>
      <dl className="flex flex-col">
        {QUESTIONS.map(({ question, answer }, index) => (
          <Reveal key={question} delay={index * 0.05} className="flex flex-col gap-2.5 border-b border-line py-6">
            <dt className="text-lg font-bold">{question}</dt>
            <dd className="max-w-[640px] text-[15px] leading-[1.55] text-muted-foreground">{answer}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
