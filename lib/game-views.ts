import { roundPoints } from "@/lib/game-store";
import type {
  AdminView,
  GameState,
  PlayView,
  Question,
} from "@/lib/types";

export function toPlayView(state: GameState, questions: Question[]): PlayView {
  const question = questions[state.questionIndex];
  return {
    role: "play",
    revision: state.revision,
    questionIndex: state.questionIndex,
    totalQuestions: questions.length,
    prompt: question.prompt,
    promptEn: question.promptEn,
    promptCs: question.promptCs,
    answers: question.answers.map((answer, index) =>
      state.revealed[index]
        ? {
            shown: true,
            text: answer.text,
            textEn: answer.textEn,
            textCs: answer.textCs,
            points: answer.points,
          }
        : { shown: false },
    ),
    strikes: state.strikes,
    roundPoints: roundPoints(state, questions),
    team1Name: state.team1Name,
    team2Name: state.team2Name,
    team1Score: state.team1Score,
    team2Score: state.team2Score,
    awardedThisRound: state.awardedThisRound,
    lastAwardedTo: state.lastAwardedTo,
  };
}

export function toAdminView(
  state: GameState,
  questions: Question[],
  sourceName: string,
): AdminView {
  const question = questions[state.questionIndex];
  return {
    role: "admin",
    revision: state.revision,
    questionIndex: state.questionIndex,
    totalQuestions: questions.length,
    prompt: question.prompt,
    promptEn: question.promptEn,
    promptCs: question.promptCs,
    answers: question.answers,
    revealed: state.revealed,
    strikes: state.strikes,
    roundPoints: roundPoints(state, questions),
    team1Name: state.team1Name,
    team2Name: state.team2Name,
    team1Score: state.team1Score,
    team2Score: state.team2Score,
    awardedThisRound: state.awardedThisRound,
    lastAwardedTo: state.lastAwardedTo,
    catalog: questions.map((item) => ({
      id: item.id,
      prompt: item.prompt,
      promptEn: item.promptEn,
      promptCs: item.promptCs,
    })),
    sourceName,
  };
}
