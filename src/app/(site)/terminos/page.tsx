import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Las reglas para usar Ópalo.",
};

const SECTIONS: LegalSection[] = [
  {
    id: "aceptacion",
    label: "Aceptación",
    content: (
      <p>
        Al crear una cuenta o usar Ópalo (opalo.me) aceptas estos términos y nuestra{" "}
        <Link href="/privacidad">Política de privacidad</Link>. Si no estás de acuerdo, no uses el servicio.
      </p>
    ),
  },
  {
    id: "tu-cuenta",
    label: "Tu cuenta",
    content: (
      <>
        <p>
          Debes tener al menos 14 años para crear una cuenta. Si eres menor de edad, necesitas la autorización de tus
          padres o de tu representante legal.
        </p>
        <p>
          Eres responsable de lo que pasa en tu cuenta y de mantener segura tu contraseña. Si crees que alguien entró sin
          permiso, avísanos de inmediato.
        </p>
      </>
    ),
  },
  {
    id: "nombre-de-usuario",
    label: "Tu nombre de usuario",
    content: (
      <>
        <p>
          El nombre de usuario forma tu enlace (opalo.me/tunombre). Puedes cambiarlo una vez cada 14 días; el nombre
          anterior queda libre para otras personas pasados 14 días.
        </p>
        <p>
          No puedes usar nombres que suplanten a otra persona, marca o empresa, ni registrarlos solo para revenderlos.
          Podemos recuperar un nombre que incumpla estas reglas.
        </p>
      </>
    ),
  },
  {
    id: "lo-que-publicas",
    label: "Lo que publicas",
    content: (
      <>
        <p>
          Eres dueño de tu contenido y responsable de él. Al publicarlo nos das permiso para mostrarlo en tu perfil y en
          vistas previas del servicio. No puedes publicar:
        </p>
        <LegalList
          items={[
            "Contenido ilegal, de odio, violento o que acose a otras personas.",
            "Contenido sexual que involucre a menores de edad, en ninguna circunstancia.",
            "Estafas, enlaces engañosos, malware o intentos de robar datos.",
            "Música, imágenes o videos sobre los que no tengas derechos o permiso.",
            "Información personal de otras personas sin su consentimiento.",
          ]}
        />
      </>
    ),
  },
  {
    id: "plan-premium",
    label: "Plan Premium",
    content: (
      <>
        <p>
          Premium cuesta 10 USD en un único pago. No es una suscripción: no hay cobros mensuales ni renovaciones, y lo
          conservas mientras exista tu cuenta y Ópalo siga funcionando.
        </p>
        <p>
          Puedes pedir el reembolso dentro de los 5 días hábiles siguientes a la compra, como establece el derecho de
          retracto. Si se reembolsa, tu cuenta vuelve al plan Gratis.
        </p>
        <p>Los pagos los procesa una pasarela externa. Ópalo no guarda los datos de tu tarjeta.</p>
      </>
    ),
  },
  {
    id: "suspension-y-cierre",
    label: "Suspensión y cierre",
    content: (
      <>
        <p>
          Podemos suspender o cerrar cuentas que incumplan estos términos, con o sin aviso previo según la gravedad. Una
          cuenta suspendida por infracciones no recibe reembolso del plan Premium.
        </p>
        <p>Puedes borrar tu cuenta cuando quieras desde Ajustes.</p>
      </>
    ),
  },
  {
    id: "responsabilidad",
    label: "Responsabilidad",
    content: (
      <p>
        Ópalo se ofrece tal como está. Hacemos lo posible para que funcione siempre, pero no garantizamos que esté libre
        de fallas o interrupciones, ni respondemos por el contenido que publican los usuarios o por los sitios externos a
        los que enlazan.
      </p>
    ),
  },
  {
    id: "cambios",
    label: "Cambios",
    content: (
      <p>
        Podemos actualizar estos términos. Si el cambio es importante, te avisaremos por correo o dentro de la app antes
        de que entre en vigor.
      </p>
    ),
  },
  {
    id: "ley-aplicable-y-contacto",
    label: "Ley aplicable y contacto",
    content: (
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Para cualquier duda, escríbenos a{" "}
        <a href="mailto:soporte@opalo.me">soporte@opalo.me</a>.
      </p>
    ),
  },
];

/** Figma 22:522 "10 Términos y condiciones". */
export default function TermsPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      intro="Estas son las reglas para usar Ópalo. Las escribimos lo más claro posible: si algo no se entiende, escríbenos."
      updatedAt="22 de octubre de 2026"
      sections={SECTIONS}
    />
  );
}
