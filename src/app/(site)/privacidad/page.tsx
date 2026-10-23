import type { Metadata } from "next";
import { LegalList, LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos guarda Ópalo, para qué los usa y cómo puedes controlarlos.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    label: "Quién es responsable",
    content: (
      <p>
        Ópalo (opalo.me) es el responsable del tratamiento de tus datos personales. Puedes contactarnos en{" "}
        <a href="mailto:privacidad@opalo.me">privacidad@opalo.me</a>.
      </p>
    ),
  },
  {
    id: "datos-que-recolectamos",
    label: "Qué datos recolectamos",
    content: (
      <LegalList
        items={[
          "Datos de tu cuenta: correo electrónico y contraseña (guardada cifrada; nunca la vemos).",
          "Datos de tu perfil: nombre de usuario, nombre, bio, ubicación, foto, fondo, música y redes que decidas agregar.",
          "Datos de uso: visitas y clics en tu perfil. No guardamos la dirección IP de los visitantes; usamos un identificador anónimo que cambia cada día.",
          "Datos de pago: el estado y el monto de tu compra. Los datos de la tarjeta los maneja la pasarela de pago, no nosotros.",
        ]}
      />
    ),
  },
  {
    id: "para-que-los-usamos",
    label: "Para qué los usamos",
    content: (
      <p>
        Para crear y mostrar tu perfil, darte estadísticas de visitas, procesar tu compra de Premium, responder tus
        mensajes, prevenir fraude y abuso, y avisarte de cambios importantes. No vendemos tus datos ni mostramos
        publicidad.
      </p>
    ),
  },
  {
    id: "que-es-publico",
    label: "Qué es público",
    content: (
      <p>
        Todo lo que agregas a tu perfil es visible para cualquier persona que entre a tu enlace. Tu correo y tus pagos
        nunca son públicos. Puedes ocultar tu ubicación, tus insignias y tu estado desde Apariencia.
      </p>
    ),
  },
  {
    id: "con-quien-los-compartimos",
    label: "Con quién los compartimos",
    content: (
      <p>
        Solo con los proveedores que necesitamos para funcionar: alojamiento y base de datos, pasarela de pagos y envío
        de correos. Todos están obligados a protegerlos. También podríamos entregarlos si una autoridad competente lo
        exige por ley.
      </p>
    ),
  },
  {
    id: "cookies",
    label: "Cookies",
    content: (
      <p>
        Usamos solo las cookies necesarias para mantener tu sesión iniciada y recordar tus preferencias. No usamos
        cookies de publicidad ni de seguimiento de terceros.
      </p>
    ),
  },
  {
    id: "tus-derechos",
    label: "Tus derechos",
    content: (
      <p>
        Puedes conocer, actualizar, rectificar y pedir que borremos tus datos, y revocar tu autorización. La mayoría
        puedes hacerlo tú mismo desde Ajustes. Para lo demás, escríbenos: respondemos las consultas en un máximo de 10
        días hábiles y los reclamos en un máximo de 15 días hábiles.
      </p>
    ),
  },
  {
    id: "cuanto-tiempo",
    label: "Cuánto tiempo los guardamos",
    content: (
      <p>
        Mientras tu cuenta exista. Si la borras, eliminamos tus datos en un plazo de 30 días, salvo los que debamos
        conservar por obligaciones legales o contables, como los registros de pago.
      </p>
    ),
  },
  {
    id: "menores-de-edad",
    label: "Menores de edad",
    content: (
      <p>
        Ópalo no está pensado para menores de 14 años. Si eres padre o tutor y crees que un menor nos dio datos sin
        autorización, escríbenos y los borraremos.
      </p>
    ),
  },
  {
    id: "cambios",
    label: "Cambios",
    content: (
      <p>
        Si cambiamos esta política de forma importante, te avisaremos por correo o dentro de la app antes de que el
        cambio aplique.
      </p>
    ),
  },
];

/** Figma 22:623 "11 Política de privacidad". */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro="Qué datos guardamos, para qué los usamos y cómo puedes controlarlos. Cumplimos la Ley 1581 de 2012 de protección de datos personales de Colombia."
      updatedAt="22 de octubre de 2026"
      sections={SECTIONS}
    />
  );
}
