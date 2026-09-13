"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useGame } from "@/hooks/use-game";
import { cn } from "@/lib/utils";

export function AdminConsole() {
  const { data, error, loading, send, uploadPack } = useGame("admin");
  const [editingTeam, setEditingTeam] = useState<0 | 1 | 2>(0);
  const [nameDraft, setNameDraft] = useState("");
  const [uploadMode, setUploadMode] = useState<"replace" | "append">("replace");
  const [busyPack, setBusyPack] = useState(false);

  useEffect(() => {
    if (!data) return;

    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (event.key >= "1" && event.key <= "5") {
        void send({ type: "toggle", answerIndex: Number(event.key) - 1 });
      } else if (event.key === "n" || event.key === "N") {
        void send({ type: "next" });
      } else if (event.key === "p" || event.key === "P") {
        void send({ type: "prev" });
      } else if (event.key === "x" || event.key === "X") {
        void send({ type: "strike" });
      } else if (event.key === "a" || event.key === "A") {
        void send({ type: "award", team: 1 });
      } else if (event.key === "b" || event.key === "B") {
        void send({ type: "award", team: 2 });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, send]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-show-cream/70">
        Načítavam pult moderátora…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Moderátor nie je spojený</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const award = async (team: 1 | 2) => {
    if (data.awardedThisRound) {
      toast.error("Toto kolo už má pridelené body.");
      return;
    }
    await send({ type: "award", team });
    toast.success(
      `${data.roundPoints} b. pre ${team === 1 ? data.team1Name : data.team2Name}`,
    );
  };

  const runPack = async (input: {
    file?: File;
    pack?: "survey" | "feud";
  }) => {
    setBusyPack(true);
    try {
      const view = await uploadPack({ ...input, mode: uploadMode });
      toast.success(`Načítaných ${view.totalQuestions} otázok · ${view.sourceName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Súbor sa nepodarilo načítať.");
    } finally {
      setBusyPack(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
      <Card className="h-fit bg-show-ink/80">
        <CardHeader>
          <CardTitle>Otázky</CardTitle>
          <CardDescription>
            {data.sourceName}
            <br />
            {data.questionIndex + 1} z {data.totalQuestions}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[42vh] space-y-1 overflow-y-auto pr-1">
          {data.catalog.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void send({ type: "goto", index })}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                index === data.questionIndex
                  ? "bg-show-yellow text-show-ink"
                  : "text-show-cream/80 hover:bg-white/10",
              )}
            >
              <span className="font-heading mr-2 opacity-70">{index + 1}.</span>
              {item.prompt}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-show-ink/80">
        <CardHeader>
          <CardTitle>Nahrať .md</CardTitle>
          <CardDescription>
            Family Feud formát (EN otázka, CZ otázka, tabuľka EN / CZ / Body)
            alebo pôvodná tabuľka prieskumu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-show-yellow/35 bg-show-purple/10 px-3 py-6 text-center hover:bg-show-purple/20"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) void runPack({ file });
            }}
          >
            <Upload className="size-6 text-show-yellow" />
            <span className="text-sm text-show-cream/80">
              Kliknite a vyberte súbor .md
            </span>
            <input
              type="file"
              accept=".md,text/markdown,text/plain"
              className="sr-only"
              disabled={busyPack}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void runPack({ file });
              }}
            />
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="upload-mode"
                checked={uploadMode === "replace"}
                onChange={() => setUploadMode("replace")}
              />
              Nahradiť aktuálnu sadu
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="upload-mode"
                checked={uploadMode === "append"}
                onChange={() => setUploadMode("append")}
              />
              Pridať na koniec
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              disabled={busyPack}
              onClick={() => void runPack({ pack: "feud" })}
            >
              Načítať sezónu 26
            </Button>
            <Button
              variant="outline"
              disabled={busyPack}
              onClick={() => void runPack({ pack: "survey" })}
            >
              Vrátiť pôvodný prieskum
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="space-y-4">
        {error ? (
          <p className="rounded-xl border border-show-magenta/40 bg-show-magenta/10 px-3 py-2 text-sm text-show-cream">
            {error}
          </p>
        ) : null}

        <Card className="bg-show-ink/80">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xl sm:text-2xl">{data.prompt}</CardTitle>
                <CardDescription>
                  Body kola: {data.roundPoints}
                  {data.awardedThisRound ? " · už pridelené" : ""}
                </CardDescription>
              </div>
              <Badge variant="secondary">Tabuľa hráčov sa mení hneď</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.answers.map((answer, index) => {
              const shown = data.revealed[index];
              return (
                <button
                  key={`${answer.text}-${index}`}
                  type="button"
                  onClick={() => void send({ type: "toggle", answerIndex: index })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                    shown
                      ? "border-show-yellow bg-show-yellow/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  )}
                >
                  <span className="font-heading marquee-num flex size-9 items-center justify-center rounded-lg bg-show-purple text-show-yellow">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-base font-medium">
                    {answer.text}
                  </span>
                  <span className="font-heading text-lg">{answer.points}</span>
                  {shown ? (
                    <Eye className="size-4 text-show-yellow" />
                  ) : (
                    <EyeOff className="size-4 opacity-50" />
                  )}
                </button>
              );
            })}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={() => void send({ type: "revealAll" })}>
                Ukázať všetky
              </Button>
              <Button variant="outline" onClick={() => void send({ type: "hideAll" })}>
                Skryť všetky
              </Button>
              <Button variant="outline" onClick={() => void send({ type: "prev" })}>
                <ChevronLeft data-icon="inline-start" />
                Predošlá
              </Button>
              <Button onClick={() => void send({ type: "next" })}>
                Ďalšia
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-show-ink/80">
            <CardHeader>
              <CardTitle>Družstvá a body</CardTitle>
              <CardDescription>
                Body z odhalených odpovedí pošlite jednému družstvu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  team: 1 as const,
                  score: data.team1Score,
                  liveName: data.team1Name,
                },
                {
                  team: 2 as const,
                  score: data.team2Score,
                  liveName: data.team2Name,
                },
              ].map((team) => (
                <div
                  key={team.team}
                  className={cn(
                    "space-y-2 rounded-2xl border-2 p-3",
                    team.team === 1
                      ? "border-show-orange/50 bg-show-orange/10"
                      : "border-show-purple/50 bg-show-purple/10",
                  )}
                >
                  <div className="flex gap-2">
                    <Input
                      value={editingTeam === team.team ? nameDraft : team.liveName}
                      onFocus={() => {
                        setEditingTeam(team.team);
                        setNameDraft(team.liveName);
                      }}
                      onChange={(event) => setNameDraft(event.target.value)}
                      onBlur={() => {
                        const nextName = nameDraft.trim() || team.liveName;
                        if (nextName !== team.liveName) {
                          void send({
                            type: "setName",
                            team: team.team,
                            name: nextName,
                          });
                        }
                        setEditingTeam(0);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        void send({
                          type: "setName",
                          team: team.team,
                          name:
                            (editingTeam === team.team ? nameDraft : team.liveName).trim() ||
                            team.liveName,
                        })
                      }
                    >
                      Uložiť
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-heading text-3xl">{team.score}</p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          void send({
                            type: "adjustScore",
                            team: team.team,
                            delta: -1,
                          })
                        }
                      >
                        −
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          void send({
                            type: "adjustScore",
                            team: team.team,
                            delta: 1,
                          })
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={data.awardedThisRound}
                    onClick={() => void award(team.team)}
                  >
                    <Trophy data-icon="inline-start" />
                    Pripočítať {data.roundPoints} b.
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-show-ink/80">
            <CardHeader>
              <CardTitle>Chyby a kolo</CardTitle>
              <CardDescription>
                Klávesy: 1–5 odhalenie, N/P otázka, X chyba, A/B body.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      "font-heading flex size-12 items-center justify-center rounded-full border-2 text-2xl",
                      data.strikes > index
                        ? "border-show-magenta bg-show-magenta text-show-ink"
                        : "border-white/20 text-white/20",
                    )}
                  >
                    X
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={() => void send({ type: "strike" })}>
                  <X data-icon="inline-start" />
                  Chyba
                </Button>
                <Button variant="outline" onClick={() => void send({ type: "clearStrikes" })}>
                  Zmazať X
                </Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void send({ type: "resetRound" })}>
                  <RotateCcw data-icon="inline-start" />
                  Reset kola
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void send({ type: "resetGame" });
                    toast.success("Nová hra. Skóre je na nule.");
                  }}
                >
                  Nová hra
                </Button>
              </div>
              {data.awardedThisRound ? (
                <p className="flex items-center gap-2 text-sm text-show-yellow">
                  <Check className="size-4" />
                  Kolo je uzavreté. Môžete ísť na ďalšiu otázku.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
