import { ChevronDown } from "lucide-react";
import { Tag } from "@/components/opal/tag";
import { LegalToc } from "./legal-toc";

export type LegalSection = {
  id: string;
  /** Short label for the table of contents. */
  label: string;
  content: React.ReactNode;
};

type LegalPageProps = {
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
};

/** Figma 22:522 / 22:623 — legal document with a sticky table of contents. */
export function LegalPage({ title, intro, updatedAt, sections }: LegalPageProps) {
  const tocItems = sections.map(({ id, label }) => ({ id, label }));

  return (
    <article>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-[18px] px-4 pt-14 pb-10 sm:px-8 lg:px-20 lg:pt-20 lg:pb-14">
          <Tag>Legal</Tag>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-[60px]">{title}</h1>
          <p className="max-w-[720px] text-base leading-[1.55] text-muted-foreground sm:text-lg">{intro}</p>
          <p className="text-sm font-semibold text-muted-foreground">Última actualización: {updatedAt}</p>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] items-start gap-24 px-4 pt-10 pb-24 sm:px-8 lg:px-20 lg:pt-14 lg:pb-[100px]">
        <aside className="sticky top-28 hidden w-[260px] shrink-0 self-start lg:block">
          <LegalToc items={tocItems} />
        </aside>

        <div className="flex min-w-0 max-w-[720px] flex-col gap-11">
          <details className="group rounded-lg border border-line bg-surface lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold">
              En esta página
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

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
              <h2 id={`${section.id}-title`} className="mb-3.5 text-[26px] font-bold tracking-[-0.01em]">
                {index + 1}. {section.label}
              </h2>
              <div className="flex flex-col gap-3.5 text-base leading-[1.65] text-muted-foreground [&_a]:font-semibold [&_a]:text-lilac [&_a]:underline-offset-4 [&_a:hover]:underline">
                {section.content}
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
