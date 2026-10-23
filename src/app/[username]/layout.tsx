import { profileFontVariables } from "@/lib/profile-fonts";

/** Loads the name fonts (Unbounded, Space Grotesk, Silkscreen, Fredoka) only on profile pages. */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className={profileFontVariables}>{children}</div>;
}
