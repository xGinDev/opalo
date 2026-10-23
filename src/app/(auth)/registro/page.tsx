import type { Metadata } from "next";
import Link from "next/link";
import { AuthColumn } from "@/components/auth/auth-column";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNext } from "@/lib/auth/redirect";
import { USERNAME_MAX } from "@/lib/username";

export const metadata: Metadata = { title: "Crea tu página" };

type Props = { searchParams: Promise<{ usuario?: string; plan?: string; next?: string }> };

/** Figma 6:222 "03 Registro". `?usuario=` comes from the landing, `?plan=premium` from "Obtener Premium". */
export default async function RegisterPage({ searchParams }: Props) {
  const { usuario, plan, next } = await searchParams;
  const destination = plan === "premium" ? "/panel/premium" : safeNext(next);
  const loginHref = destination === "/panel" ? "/login" : `/login?next=${encodeURIComponent(destination)}`;

  return (
    <AuthColumn
      title="Crea tu página"
      description="Elige tu enlace y empieza gratis. Toma menos de un minuto."
      footer={
        <>
          ¿Ya tienes cuenta? <Link href={loginHref}>Inicia sesión</Link>
        </>
      }
    >
      <RegisterForm next={destination} initialUsername={usuario?.slice(0, USERNAME_MAX * 2) ?? ""} />
    </AuthColumn>
  );
}
