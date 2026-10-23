import { notFound } from "next/navigation";
import { StatCard } from "@/components/opal/stat-card";
import { AppearanceEditor } from "@/components/panel/appearance-editor";
import { PanelCard } from "@/components/panel/editor-ui";
import { MusicEditor } from "@/components/panel/music-editor";
import { PaymentResult } from "@/components/panel/payment-result";
import { InfoCard, LinksCard, QuickAppearanceCard } from "@/components/panel/profile-sections";
import { SettingsForms } from "@/components/panel/settings-forms";
import { DailyChart, NetworkChart } from "@/components/panel/stats-charts";

type Props = { params: Promise<{ seccion?: string[] }> };

/** Deterministic fake 30-day series for the charts. */
const DAYS = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 8, 23 + i));
  const views = Math.round(120 + 60 * Math.sin(i / 3) + i * 4);
  return { day: date.toISOString().slice(0, 10), views, clicks: Math.round(views * (0.18 + 0.05 * Math.cos(i))) };
});

export default async function DevPanelPage({ params }: Props) {
  const section = (await params).seccion?.[0] ?? "";
  switch (section) {
    case "":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Visitas totales" value="48.210" change="+12% esta semana" />
            <StatCard label="Clics en redes" value="3.904" change="+8% esta semana" />
            <StatCard label="Visitas hoy" value="236" change="+31 desde ayer" />
          </div>
          <InfoCard />
          <LinksCard />
          <QuickAppearanceCard />
        </>
      );
    case "apariencia":
      return <AppearanceEditor />;
    case "redes":
      return <LinksCard />;
    case "musica":
      return <MusicEditor />;
    case "ajustes":
      return <SettingsForms />;
    case "pago-ok":
      return <PaymentResult status="paid" />;
    case "pago-pendiente":
      return <PaymentResult status="pending" />;
    case "pago-fallido":
      return <PaymentResult status="failed" />;
    case "estadisticas":
      return (
        <>
          <PanelCard title="Visitas y clics por día" description="Cada persona cuenta una vez cada 30 minutos.">
            <DailyChart data={DAYS} />
          </PanelCard>
          <PanelCard title="Clics por red" description="Últimos 30 días.">
            <NetworkChart
              data={[
                { platform: "instagram", clicks: 1840 },
                { platform: "discord", clicks: 1210 },
                { platform: "youtube", clicks: 640 },
                { platform: "spotify", clicks: 214 },
              ]}
            />
          </PanelCard>
        </>
      );
    default:
      notFound();
  }
}
