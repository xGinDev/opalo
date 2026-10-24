import { notFound } from "next/navigation";
import { RootDocument } from "@/components/root-document";

/** Dev-only review harnesses (Spanish). Not available in production. */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <RootDocument locale="es">{children}</RootDocument>;
}
