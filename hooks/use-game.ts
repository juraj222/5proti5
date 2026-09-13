"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminView, GameAction, GameView, PlayView } from "@/lib/types";

async function readJson(response: Response) {
  if (!response.ok) {
    throw new Error("Hru sa nepodarilo načítať.");
  }
  return (await response.json()) as GameView;
}

export function useGame<T extends "play" | "admin">(role: T) {
  const [data, setData] = useState<(T extends "admin" ? AdminView : PlayView) | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/game?role=${role}`, { cache: "no-store" });
    const json = await readJson(response);
    setData(json as T extends "admin" ? AdminView : PlayView);
    setError(null);
  }, [role]);

  const send = useCallback(
    async (action: GameAction) => {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ...action }),
      });
      const json = await readJson(response);
      setData(json as T extends "admin" ? AdminView : PlayView);
      setError(null);
    },
    [role],
  );

  const uploadPack = useCallback(
    async (input: { file?: File; mode: "replace" | "append"; pack?: "survey" | "feud" }) => {
      const form = new FormData();
      form.set("mode", input.mode);
      if (input.pack) form.set("pack", input.pack);
      if (input.file) form.set("file", input.file);
      const response = await fetch("/api/game/questions", {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Súbor sa nepodarilo načítať.");
      }
      const json = (await response.json()) as AdminView;
      setData(json as T extends "admin" ? AdminView : PlayView);
      setError(null);
      return json;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const response = await fetch(`/api/game?role=${role}`, { cache: "no-store" });
        const json = await readJson(response);
        if (!cancelled) {
          setData(json as T extends "admin" ? AdminView : PlayView);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Spojenie s hrou vypadlo. Skontrolujte, či beží server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void tick();
    const interval = window.setInterval(() => {
      void tick();
    }, 350);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [role]);

  return { data, error, loading, send, refresh, uploadPack };
}
