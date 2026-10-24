import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** Locale-aware Link, redirect, usePathname, useRouter (they keep the /en, /pt… prefix). */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
