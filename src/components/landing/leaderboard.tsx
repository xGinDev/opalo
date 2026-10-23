import { getLeaderboard } from "@/lib/landing/leaderboard";
import { LeaderboardTabs } from "./leaderboard-tabs";
import { SectionHeading } from "./section-heading";

/** Replaces Figma 5:97 "Ejemplos": the 30 most visited profiles, all time and this month. */
export async function Leaderboard() {
  const [allTime, month] = await Promise.all([getLeaderboard("all"), getLeaderboard("month")]);

  return (
    <section
      id="clasificacion"
      aria-labelledby="clasificacion-title"
      className="mx-auto flex max-w-[1440px] scroll-mt-24 flex-col gap-10 px-4 pt-10 pb-20 sm:px-8 lg:gap-14 lg:px-20 lg:pb-[110px]"
    >
      <SectionHeading
        id="clasificacion-title"
        title="Tabla de clasificación"
        description="Los 30 perfiles más visitados de Ópalo. ¿Llegará el tuyo?"
      />
      <LeaderboardTabs allTime={allTime} month={month} />
    </section>
  );
}
