import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";

/** Figma 6:127 / 6:222 — form column on the left, decorative panel on the right (xl and up). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh xl:py-3 xl:pe-3">
      <main className="flex w-full flex-col xl:w-[600px] xl:shrink-0">{children}</main>
      <AuthVisualPanel className="sticky top-3 hidden h-[calc(100dvh-24px)] min-h-[760px] flex-1 xl:flex" />
    </div>
  );
}
