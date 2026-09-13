"use client";

import { BilingualText } from "@/components/bilingual-text";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type BoardAnswer = {
  shown: boolean;
  text?: string;
  textEn?: string;
  textCs?: string;
  points?: number;
};

type GameBoardProps = {
  prompt: string;
  promptEn?: string;
  promptCs?: string;
  questionIndex: number;
  totalQuestions: number;
  answers: BoardAnswer[];
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  strikes: number;
  roundPoints: number;
  awardedThisRound: boolean;
  lastAwardedTo: 0 | 1 | 2;
};

function TeamPill({
  name,
  score,
  accent,
  active,
}: {
  name: string;
  score: number;
  accent: "orange" | "purple";
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center rounded-3xl border-2 px-4 py-4 text-center shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:px-6",
        accent === "orange"
          ? "border-show-orange/70 bg-show-orange/20"
          : "border-show-purple/70 bg-show-purple/25",
        active && "ring-2 ring-show-yellow",
      )}
    >
      <p className="font-heading max-w-full truncate text-lg tracking-[0.18em] text-show-cream/80 uppercase sm:text-xl">
        {name}
      </p>
      <p className="font-heading mt-1 text-5xl leading-none text-white sm:text-6xl">
        {score}
      </p>
    </div>
  );
}

function AnswerTile({
  index,
  answer,
}: {
  index: number;
  answer: BoardAnswer;
}) {
  return (
    <div className="tile-scene h-[6.75rem] sm:h-[7.25rem] md:h-32">
      <div className={cn("tile-flip", answer.shown && "is-flipped")}>
        <div className="tile-face tile-back">
          <span className="font-heading marquee-num text-4xl sm:text-5xl">
            {index + 1}
          </span>
        </div>
        <div className="tile-face tile-front">
          <BilingualText
            cs={answer.textCs || answer.text}
            en={answer.textEn}
            fallback={answer.text}
            className="min-w-0 flex-1 justify-center pr-3 text-base leading-tight font-semibold tracking-wide text-white sm:text-xl md:text-2xl"
            secondaryClassName="mt-1 text-sm font-medium tracking-normal text-white sm:text-base md:text-lg"
          />
          <span className="font-heading shrink-0 rounded-xl bg-show-yellow px-3 py-1 text-2xl leading-none text-show-ink sm:text-3xl">
            {answer.points}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GameBoard({
  prompt,
  promptEn,
  promptCs,
  questionIndex,
  totalQuestions,
  answers,
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  strikes,
  roundPoints,
  awardedThisRound,
  lastAwardedTo,
}: GameBoardProps) {
  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-8 sm:py-7">
      <header className="flex items-center justify-between gap-4">
        <BrandLogo width={280} priority className="w-[9.5rem] sm:w-[14rem]" />
        <p className="font-heading text-lg text-show-yellow sm:text-2xl">
          {questionIndex + 1} / {totalQuestions}
        </p>
      </header>

      <div className="flex items-stretch gap-3 sm:gap-5">
        <TeamPill
          name={team1Name}
          score={team1Score}
          accent="orange"
          active={lastAwardedTo === 1}
        />
        <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-3xl border-2 border-show-yellow/50 bg-show-ink/70 sm:w-32">
          <p className="text-[0.65rem] tracking-[0.2em] text-show-yellow uppercase">
            Kolo
          </p>
          <p className="font-heading text-4xl text-show-yellow sm:text-5xl">
            {roundPoints}
          </p>
        </div>
        <TeamPill
          name={team2Name}
          score={team2Score}
          accent="purple"
          active={lastAwardedTo === 2}
        />
      </div>

      <div className="rounded-2xl border-2 border-show-yellow/25 bg-show-ink/55 px-4 py-4 text-white sm:px-8">
        <BilingualText
          cs={promptCs || prompt}
          en={promptEn}
          fallback={prompt}
          className="items-center text-center text-lg leading-snug sm:text-2xl md:text-3xl"
          secondaryClassName="mt-2 text-base font-normal text-show-cream sm:text-xl md:text-2xl"
        />
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {answers.map((answer, index) => (
          <AnswerTile key={index} index={index} answer={answer} />
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 pb-2">
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={cn(
                "font-heading flex size-12 items-center justify-center rounded-full border-2 text-3xl sm:size-14",
                strikes > index
                  ? "border-show-magenta bg-show-magenta text-show-ink"
                  : "border-white/20 text-transparent",
              )}
            >
              X
            </span>
          ))}
        </div>
        {awardedThisRound ? (
          <p className="text-sm tracking-wide text-show-yellow">
            Body z tohto kola už sú na tabuli.
          </p>
        ) : (
          <p className="text-sm tracking-wide text-show-cream/50">
            Odpovede sa otvárajú z pultu moderátora.
          </p>
        )}
      </div>
    </div>
  );
}
