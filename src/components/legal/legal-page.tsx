import { ChevronDown } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Tag } from "@/components/opal/tag";
import { Link } from "@/i18n/navigation";
import { LegalToc } from "./legal-toc";

/** A section's content in the Legal messages: paragraphs, or `{ list: [...] }` for bullets. */
type Block = string | { list: string[] };

/** Tags allowed inside legal texts. */
const tags = {
  privacy: (chunks: React.ReactNode) => <Link href="/privacidad">{chunks}</Link>,
  terms: (chunks: React.ReactNode) => <Link href="/terminos">{chunks}</Link>,
  support: (chunks: React.ReactNode) => <a href="mailto:soporte@opalo.me">{chunks}</a>,
  privacyEmail: (chunks: React.ReactNode) => <a href="mailto:privacidad@opalo.me">{chunks}</a>,
  strong: (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>,
};

type LegalPageProps = {
  /** Which document under the Legal messages. */
  doc: "terms" | "privacy";
  /** Last update (ISO date), formatted in the reader's language. */
  updatedAt: string;
};

/** Figma 22:522 / 22:623 — legal document with a sticky table of contents. */
export async function LegalPage({ doc, updatedAt }: LegalPageProps) {
  const [t, format] = await Promise.all([getTranslations("Legal"), getFormatter()]);
  const sections = Object.entries(t.raw(`${doc}.sections`) as Record<string, { label: string; blocks: Block[] }>);
  const tocItems = sections.map(([id, section]) => ({ id, label: section.label }));
  const date = format.dateTime(new Date(`${updatedAt}T12:00:00Z`), { day: "numeric", month: "long", year: "numeric" });

  return (
    <article>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-[18px] px-4 pt-14 pb-10 sm:px-8 lg:px-20 lg:pt-20 lg:pb-14">
          <Tag>{t("tag")}</Tag>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[60px]">{t(`${doc}.title`)}</h1>
          <p className="max-w-[720px] text-base leading-[1.55] text-muted-foreground sm:text-lg">{t(`${doc}.intro`)}</p>
          <p className="text-sm font-semibold text-muted-foreground">{t("updated", { date })}</p>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] items-start gap-24 px-4 pt-10 pb-24 sm:px-8 lg:px-20 lg:pt-14 lg:pb-[100px]">
        <aside className="sticky top-28 hidden w-[260px] shrink-0 self-start lg:block">
          <LegalToc items={tocItems} title={t("onThisPage")} />
        </aside>

        <div className="flex min-w-0 max-w-[720px] flex-col gap-11">
          <details className="group rounded-lg border border-line bg-surface lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold">
              {t("onThisPage")}
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ol className="flex flex-col border-t border-line px-4 py-2">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          {sections.map(([id, section], index) => (
            <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
              <h2 id={`${id}-title`} className="mb-3.5 text-[26px] font-bold tracking-[-0.01em]">
                {index + 1}. {section.label}
              </h2>
              <div className="flex flex-col gap-3.5 text-base leading-[1.65] text-muted-foreground [&_a]:font-semibold [&_a]:text-lilac [&_a]:underline-offset-4 [&_a:hover]:underline">
                {section.blocks.map((block, b) => {
                  const key = `${doc}.sections.${id}.blocks.${b}`;
                  if (typeof block === "string") return <p key={b}>{t.rich(key, tags)}</p>;
                  return <LegalList key={b} items={block.list.map((_, i) => t.rich(`${key}.list.${i}`, tags))} />;
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

/** Bulleted list with the lilac dots from the Figma. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-[0.68em] size-1.5 shrink-0 rounded-full bg-lilac" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
