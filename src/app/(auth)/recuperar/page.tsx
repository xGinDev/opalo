import type { Metadata } from "next";
import Link from "next/link";
import { AuthColumn } from "@/components/auth/auth-column";
import { RecoverForm } from "@/components/auth/recover-forms";

export const metadata: Metadata = { title: "Recuperar contraseña" };

/** Not in the Figma: reuses the login layout. */
export default function RecoverPage() {
  return (
    <AuthColumn
      title="Recupera tu acceso"
      description="Escribe el correo de tu cuenta y te enviamos un enlace para crear una contraseña nueva."
      footer={
        <>
          ¿La recordaste? <Link href="/login">Inicia sesión</Link>
        </>
      }
    >
      <RecoverForm />
    </AuthColumn>
  );
}
