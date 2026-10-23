import { Logo } from "@/components/brand/logo";

type AuthColumnProps = {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Bottom line, e.g. "¿No tienes cuenta? Crea una gratis". */
  footer?: React.ReactNode;
};

/** Left column of the auth screens: logo on top, form in the middle, switch link at the bottom. */
export function AuthColumn({ title, description, children, footer }: AuthColumnProps) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-10 px-4 py-6 sm:px-10 lg:px-20 lg:py-10">
      <Logo href="/" />
      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-5 xl:mx-0">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-[34px] leading-tight font-bold tracking-[-0.02em] sm:text-[40px]">{title}</h1>
          {description && <p className="text-base leading-normal text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
      <div className="mx-auto w-full max-w-[440px] text-sm font-medium text-muted-foreground xl:mx-0 [&_a]:font-bold [&_a]:text-lilac [&_a]:underline-offset-4 [&_a:hover]:underline">
        {footer}
      </div>
    </div>
  );
}

/** "o con tu correo" separator between OAuth and the email form. */
export function AuthDivider({ label = "o con tu correo" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}
