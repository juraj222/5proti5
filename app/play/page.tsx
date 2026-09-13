"use client";

import { GameBoard } from "@/components/game-board";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";

export default function PlayPage() {
  const { data, error, loading } = useGame("play");

  if (loading && !data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-show-cream/70">
        Pripravujeme tabuľu…
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Tabuľa nie je spojená</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="flex min-h-full flex-1 flex-col">
      {error ? (
        <p className="px-4 pt-3 text-center text-sm text-show-yellow">{error}</p>
      ) : null}
      <GameBoard
        prompt={data.prompt}
        questionIndex={data.questionIndex}
        totalQuestions={data.totalQuestions}
        answers={data.answers}
        team1Name={data.team1Name}
        team2Name={data.team2Name}
        team1Score={data.team1Score}
        team2Score={data.team2Score}
        strikes={data.strikes}
        roundPoints={data.roundPoints}
        awardedThisRound={data.awardedThisRound}
        lastAwardedTo={data.lastAwardedTo}
      />
    </main>
  );
}
