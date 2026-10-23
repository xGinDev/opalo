"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Eye, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { sectionFor } from "./nav";
import { LivePreview } from "./live-preview";
import { PanelHeader } from "./panel-header";
import { PanelSidebar } from "./panel-sidebar";
import { SaveBar } from "./save-bar";

/** Figma 7:209 layout: sidebar · content (header + editor) · live preview. */
export function PanelShell({ children }: { children: React.ReactNode }) {
  const section = sectionFor(usePathname());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 overflow-y-auto border-r border-line lg:block">
        <PanelSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <Logo href="/" />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú del panel">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-line bg-background p-0">
              <SheetTitle className="sr-only">Menú del panel</SheetTitle>
              <SheetDescription className="sr-only">Secciones de tu panel</SheetDescription>
              <PanelSidebar onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex flex-col gap-7 px-4 py-6 sm:px-8 lg:px-10 lg:py-7">
          <PanelHeader />
          <div className={section.preview ? "grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]" : "max-w-[960px]"}>
            <div className="flex min-w-0 flex-col gap-5">
              {children}
              {section.save && <SaveBar aboveMobileButton={section.preview} />}
            </div>
            {section.preview && (
              <div className="sticky top-7 hidden xl:block">
                <LivePreview />
              </div>
            )}
          </div>
        </main>
      </div>

      {section.preview && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="opal" className="fixed right-4 bottom-4 z-40 shadow-lg xl:hidden">
              <Eye aria-hidden /> Vista previa
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-auto max-w-full items-center justify-center overflow-y-auto border-line bg-background p-5">
            <SheetTitle className="sr-only">Vista previa</SheetTitle>
            <SheetDescription className="sr-only">Así se ve tu perfil</SheetDescription>
            <LivePreview />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
