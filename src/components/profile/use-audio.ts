"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State and controls for the profile song. Returns `[ref, controls]`: attach the ref to the
 * <audio> element the caller renders; `controls` is plain state and is safe to read in render.
 */
export function useAudio(src: string | null, volume = 1) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    const sync = () => {
      setPlaying(!audio.paused);
      setCurrent(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setMuted(audio.muted);
    };
    const events = ["play", "pause", "timeupdate", "loadedmetadata", "durationchange", "volumechange", "ended"];
    events.forEach((e) => audio.addEventListener(e, sync));
    return () => events.forEach((e) => audio.removeEventListener(e, sync));
  }, [src]);

  // The owner picks the volume (0–1); visitors can still mute it.
  useEffect(() => {
    if (ref.current) ref.current.volume = Math.min(1, Math.max(0, volume));
  }, [src, volume]);

  const play = useCallback(async () => {
    try {
      await ref.current?.play();
    } catch {
      // Autoplay blocked or no source: the user can press play.
    }
  }, []);

  const toggle = useCallback(() => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) void play();
    else audio.pause();
  }, [play]);

  const seek = useCallback((seconds: number) => {
    if (ref.current) ref.current.currentTime = seconds;
  }, []);

  /** One song: "previous" and "next" both start it over. */
  const restart = useCallback(() => {
    if (!ref.current) return;
    ref.current.currentTime = 0;
    void play();
  }, [play]);

  const toggleMute = useCallback(() => {
    if (ref.current) ref.current.muted = !ref.current.muted;
  }, []);

  const controls = { playing, muted, current, duration, play, toggle, seek, restart, toggleMute };
  return [ref, controls] as const;
}

export type AudioControls = ReturnType<typeof useAudio>[1];
