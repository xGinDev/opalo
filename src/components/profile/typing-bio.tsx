"use client";

import { useEffect, useState } from "react";
import { bioPhrases } from "@/lib/profile/format";
import { cn } from "@/lib/utils";

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1800;
const GAP_MS = 380;

type State = { phrase: number; chars: number; deleting: boolean };

/**
 * Bio that types itself. Phrases separated by "|" rotate: each is typed, held and erased.
 * A single phrase is typed once and stays. With reduced motion the whole bio is shown as text.
 */
export function TypingBio({ bio, still, className }: { bio: string | null; still: boolean; className?: string }) {
  const phrases = bioPhrases(bio);
  const [state, setState] = useState<State>({ phrase: 0, chars: 0, deleting: false });
  const key = phrases.join("|");

  useEffect(() => {
    if (still || phrases.length === 0) return;
    const current = phrases[state.phrase % phrases.length];
    const single = phrases.length === 1;

    let delay = state.deleting ? DELETE_MS : TYPE_MS;
    let next: State;
    if (!state.deleting && state.chars < current.length) {
      next = { ...state, chars: state.chars + 1 };
    } else if (!state.deleting) {
      if (single) return; // typed once, stays
      delay = HOLD_MS;
      next = { ...state, deleting: true };
    } else if (state.chars > 0) {
      next = { ...state, chars: state.chars - 1 };
    } else {
      delay = GAP_MS;
      next = { phrase: (state.phrase + 1) % phrases.length, chars: 0, deleting: false };
    }

    const timer = setTimeout(() => setState(next), delay);
    return () => clearTimeout(timer);
    // `key` captures phrase changes (live preview edits).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, still, key]);

  // Restart when the bio itself changes.
  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setLastKey(key);
    setState({ phrase: 0, chars: 0, deleting: false });
  }

  if (phrases.length === 0) return null;

  if (still) {
    return <p className={className}>{phrases.join(" · ")}</p>;
  }

  const visible = phrases[state.phrase % phrases.length].slice(0, state.chars);

  return (
    <p className={cn("min-h-[1.4em]", className)}>
      <span className="sr-only">{phrases.join(". ")}</span>
      <span aria-hidden>
        {visible}
        <span className="animate-blink ml-px inline-block h-[1.05em] w-[2px] translate-y-[0.15em] bg-white" />
      </span>
    </p>
  );
}
