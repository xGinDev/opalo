import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye, Lock, MessageCircle, Camera, SquarePlay } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { opalIcons } from "@/components/opal/icons";
import { NavItem } from "@/components/opal/nav-item";
import { PlanCard } from "@/components/opal/plan-card";
import { ProfilePreview } from "@/components/opal/profile-preview";
import { StatCard } from "@/components/opal/stat-card";
import { Tag } from "@/components/opal/tag";
import { GlowBackdrop } from "@/components/profile/glow-backdrop";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LeaderboardTabs } from "@/components/landing/leaderboard-tabs";
import type { LeaderboardRow } from "@/lib/landing/leaderboard";
import { ToastDemo } from "./toast-demo";

const MOCK_LEADERBOARD: LeaderboardRow[] = Array.from({ length: 30 }, (_, i) => ({
  rank: i + 1,
  username: ["nico", "luna", "kairo", "$", "estudionorte", "vale"][i % 6] + (i >= 6 ? String(i) : ""),
  display_name: i % 4 === 0 ? null : ["Nico", "Luna ☾", "kairo", "Ópalo", "Estudio Norte", "vale"][i % 6],
  avatar_url: null,
  plan: i % 3 === 0 ? "premium" : "free",
  views: Math.round(48210 / (1 + i * 0.6)),
}));

export const metadata: Metadata = { title: "UI", robots: { index: false } };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-sans text-[13px] font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Componentes de Ópalo</h1>
        <p className="text-muted-foreground">Página interna para revisar el sistema de diseño (Figma 2:2).</p>
      </header>

      <Section title="Íconos">
        <ul className="flex flex-wrap gap-x-6 gap-y-4">
          {Object.entries(opalIcons).map(([name, Icon]) => (
            <li key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="block rounded-sm">
                    <Icon className="size-6" strokeWidth={1.75} aria-label={name} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Logo">
        <div className="flex items-center gap-8">
          <Logo href="/" />
          <Logo iconOnly />
        </div>
      </Section>

      <Section title="Botón">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="opal">Botón</Button>
          <Button variant="secondary">Botón</Button>
          <Button variant="ghost">Botón</Button>
          <Button>Primario lila</Button>
          <Button variant="destructive">Borrar</Button>
          <Button variant="link">Enlace</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="opal" size="lg">
            Reservar mi enlace
          </Button>
          <Button variant="opal" size="sm">
            Pequeño
          </Button>
          <Button variant="secondary" disabled>
            Deshabilitado
          </Button>
          <Button variant="secondary" size="icon" aria-label="Más opciones">
            <opalIcons.dots />
          </Button>
          <Button variant="secondary">
            <Lock /> Solo Premium
          </Button>
        </div>
      </Section>

      <Section title="Campo">
        <div className="grid max-w-[360px] gap-2">
          <Label htmlFor="demo-field">Etiqueta</Label>
          <Input id="demo-field" placeholder="Escribe aquí" />
        </div>
        <div className="grid max-w-[360px] gap-2">
          <Label htmlFor="demo-invalid">Usuario</Label>
          <Input id="demo-invalid" defaultValue="nico." aria-invalid />
          <p className="text-[13px] text-danger">No puede terminar en punto.</p>
        </div>
        <div className="grid max-w-[360px] gap-2">
          <Label htmlFor="demo-bio">Bio</Label>
          <Textarea id="demo-bio" placeholder="dev de día | gamer de noche" />
        </div>
      </Section>

      <Section title="Ítem de menú">
        <div className="flex flex-wrap gap-12">
          <div className="w-56">
            <NavItem href="#" icon={opalIcons.home} label="Resumen" />
          </div>
          <div className="w-56">
            <NavItem href="#" icon={opalIcons.home} label="Resumen" active />
          </div>
        </div>
      </Section>

      <Section title="Tarjeta de métrica">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Visitas totales" value="48.210" change="+12% esta semana" />
          <StatCard label="Clics en redes" value="9.384" change="-3% esta semana" trend="down" />
          <StatCard label="Usuarios Premium" value="1.204" />
        </div>
      </Section>

      <Section title="Etiqueta">
        <div className="flex flex-wrap gap-2">
          <Tag>Premium</Tag>
          <Tag tone="pink">Nuevo</Tag>
          <Tag tone="aqua">En línea</Tag>
          <Tag tone="gold">Fundador</Tag>
          <Tag tone="success">Pagado</Tag>
          <Tag tone="danger">Suspendido</Tag>
          <Tag tone="neutral">Gratis</Tag>
          <Tag tone="opal">Pago único</Tag>
          <Badge>Badge shadcn</Badge>
        </div>
      </Section>

      <Section title="Tarjetas de plan">
        <div className="grid items-start gap-6 md:grid-cols-2">
          <PlanCard
            name="Gratis"
            price="$0"
            period="para siempre"
            description="Todo lo básico para tener tu página lista hoy."
            action={<Button variant="secondary">Empezar gratis</Button>}
            features={[
              "Tu enlace opalo.me/tunombre",
              "Hasta 6 redes sociales",
              "Fondo de color y 3 estilos de partículas",
              "Contador de visitas",
              "Marca de Ópalo al pie del perfil",
            ]}
          />
          <PlanCard
            highlighted
            name="Premium"
            tag="Pago único"
            price="$10"
            period="USD, de por vida"
            description="Desbloquea todo sin suscripciones ni cobros mensuales."
            action={<Button variant="opal">Obtener Premium</Button>}
            features={[
              "Todo lo del plan Gratis",
              "Redes y enlaces ilimitados",
              "Fondo en video o GIF",
              "Música en tu perfil",
              "Todos los efectos, tipografías y cursores",
              "Insignia Premium junto a tu nombre",
              "Estadísticas detalladas",
              "Sin la marca de Ópalo",
            ]}
          />
        </div>
      </Section>

      <Section title="Vista previa del perfil (marco; el contenido real llega en la fase 4)">
        <ProfilePreview>
          <GlowBackdrop />
          <div className="relative flex h-full flex-col items-center gap-3.5 px-6 pt-[72px] pb-10 text-center">
            <div className="size-[92px] rounded-full bg-opal shadow-[0_0_30px_rgba(185,167,255,0.45)] ring-2 ring-white/20" />
            <p className="font-display text-[32px] leading-none font-extrabold tracking-[-0.02em] [text-shadow:0_0_14px_rgba(255,255,255,0.5)]">
              nico
            </p>
            <p className="text-sm font-semibold">dev de día, gamer de noche</p>
            <div className="flex gap-4 pt-2 [&_svg]:size-6 [&_svg]:drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]">
              <MessageCircle aria-label="Discord" />
              <Camera aria-label="Instagram" />
              <SquarePlay aria-label="YouTube" />
            </div>
            <p className="flex items-center gap-1.5 pt-2.5 text-xs font-bold text-muted-foreground">
              <Eye className="size-3.5" aria-hidden /> 48.210 visitas
            </p>
            <p className="pt-[60px] text-[11px] font-semibold text-muted-foreground">Hecho con ópalo</p>
          </div>
        </ProfilePreview>
      </Section>

      <Section title="Controles (shadcn)">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-line bg-surface p-4">
            <Label htmlFor="demo-switch">Mostrar insignias</Label>
            <Switch id="demo-switch" defaultChecked />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
            <Label>Opacidad de la tarjeta</Label>
            <Slider defaultValue={[60]} max={100} step={1} aria-label="Opacidad de la tarjeta" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipografía del nombre</Label>
            <Select defaultValue="bricolage">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bricolage">Bricolage Grotesque</SelectItem>
                <SelectItem value="unbounded">Unbounded</SelectItem>
                <SelectItem value="silkscreen">Silkscreen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue="7">
            <TabsList>
              <TabsTrigger value="7">7 días</TabsTrigger>
              <TabsTrigger value="30">30 días</TabsTrigger>
              <TabsTrigger value="90">90 días</TabsTrigger>
            </TabsList>
            <TabsContent value="7" className="pt-2 text-sm text-muted-foreground">
              Visitas de la última semana.
            </TabsContent>
            <TabsContent value="30" className="pt-2 text-sm text-muted-foreground">
              Visitas del último mes.
            </TabsContent>
            <TabsContent value="90" className="pt-2 text-sm text-muted-foreground">
              Visitas de los últimos 3 meses.
            </TabsContent>
          </Tabs>
        </div>
      </Section>

      <Section title="Superposiciones">
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Abrir diálogo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reportar perfil</DialogTitle>
                <DialogDescription>Cuéntanos qué pasa con este perfil.</DialogDescription>
              </DialogHeader>
              <Textarea placeholder="Motivo del reporte" />
              <DialogFooter>
                <Button variant="opal">Enviar reporte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Abrir panel lateral</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Detalle del usuario</SheetTitle>
                <SheetDescription>@nico · Premium desde marzo 2026</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Menú</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Desactivar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Borrar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ToastDemo />
      </Section>

      <Section title="Tarjeta, tabla, avatar y skeleton">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios recientes</CardTitle>
            <CardDescription>Últimos registros en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["nico", "Premium", "48.210"],
                  ["luna", "Gratis", "1.032"],
                  ["kairo", "Premium", "12.877"],
                ].map(([user, plan, views]) => (
                  <TableRow key={user}>
                    <TableCell>
                      <span className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{user[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {user}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tag tone={plan === "Premium" ? "lilac" : "neutral"}>{plan}</Tag>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{views}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Section>

      <Section title="Tabla de clasificación (datos de prueba; Este mes vacío)">
        <LeaderboardTabs allTime={MOCK_LEADERBOARD} month={[]} />
      </Section>
    </main>
  );
}
