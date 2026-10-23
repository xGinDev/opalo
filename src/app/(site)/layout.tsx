import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

/** Public marketing pages: landing, legal and contact. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">{children}</main>
      <SiteFooter />
    </>
  );
}
