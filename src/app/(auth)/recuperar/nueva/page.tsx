import type { Metadata } from "next";
import Link from "next/link";
import { AuthColumn } from "@/components/auth/auth-column";
import { NewPasswordForm } from "@/components/auth/recover-forms";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nueva contraseña" };

/** Landing page of the recovery email link (the link signs the user in first). */
export default async function NewPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const hasSession = Boolean(data?.claims);

  if (!hasSession) {
    return (
      <AuthColumn
        title="El enlace expiró"
        description="Los enlaces para recuperar la contraseña duran poco y solo sirven una vez. Pide uno nuevo."
      >
        <Button variant="opal" asChild>
          <Link href="/recuperar">Pedir otro enlace</Link>
        </Button>
      </AuthColumn>
    );
  }

  return (
    <AuthColumn title="Crea una contraseña nueva" description="Usa al menos 8 caracteres.">
      <NewPasswordForm />
    </AuthColumn>
  );
}
