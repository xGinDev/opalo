import type { Metadata } from "next";
import Link from "next/link";
import { AuthColumn } from "@/components/auth/auth-column";
import { LoginForm } from "@/components/auth/login-form";
import { translateError } from "@/lib/errors";

export const metadata: Metadata = { title: "Iniciar sesión" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

/** Figma 6:127 "02 Iniciar sesión". */
export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const initialError = error
    ? translateError({ code: error }, "No pudimos iniciar sesión. Inténtalo de nuevo.")
    : undefined;

  return (
    <AuthColumn
      title="Hola de nuevo"
      description="Entra para editar tu perfil y ver tus visitas."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}>Crea una gratis</Link>
        </>
      }
    >
      <LoginForm next={next} initialError={initialError} />
    </AuthColumn>
  );
}
