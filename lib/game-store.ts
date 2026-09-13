import {
  BUNDLED_FEUD_PATH,
  BUNDLED_SURVEY_PATH,
  clearSavedQuestionPack,
  loadQuestions,
  loadQuestionsFromFile,
  parseQuestionsMarkdown,
  saveQuestionPack,
} from "@/lib/questions";
import type { GameAction, GameState, Question } from "@/lib/types";

type GlobalGame = {
  questions: Question[];
  sourceName: string;
  state: GameState;
};

const globalForGame = globalThis as typeof globalThis & {
  __fiveAgainstFive?: GlobalGame;
};

function emptyRevealed(count: number) {
  return Array.from({ length: count }, () => false);
}

function createState(questions: Question[], questionIndex = 0): GameState {
  const question = questions[questionIndex] ?? questions[0];
  return {
    questionIndex,
    revealed: emptyRevealed(question.answers.length),
    strikes: 0,
    team1Name: "Družstvo A",
    team2Name: "Družstvo B",
    team1Score: 0,
    team2Score: 0,
    awardedThisRound: false,
    lastAwardedTo: 0,
    revision: 1,
  };
}

function getStore(): GlobalGame {
  if (!globalForGame.__fiveAgainstFive) {
    const loaded = loadQuestions();
    globalForGame.__fiveAgainstFive = {
      questions: loaded.questions,
      sourceName: loaded.sourceName,
      state: createState(loaded.questions),
    };
  }
  if (!globalForGame.__fiveAgainstFive.sourceName) {
    globalForGame.__fiveAgainstFive.sourceName = "Prieskum 5 proti 5";
  }
  return globalForGame.__fiveAgainstFive;
}

export function getQuestions() {
  return getStore().questions;
}

export function getSourceName() {
  return getStore().sourceName;
}

function reindex(questions: Question[]) {
  return questions.map((question, index) => ({ ...question, id: index + 1 }));
}

export function installQuestionPack(
  questions: Question[],
  sourceName: string,
  mode: "replace" | "append",
) {
  if (questions.length === 0) {
    throw new Error("V súbore sa nenašli žiadne otázky.");
  }
  const store = getStore();
  const scores = {
    team1Name: store.state.team1Name,
    team2Name: store.state.team2Name,
    team1Score: store.state.team1Score,
    team2Score: store.state.team2Score,
  };

  if (mode === "append") {
    store.questions = reindex([...store.questions, ...questions]);
    store.sourceName = `${store.sourceName} + ${sourceName}`;
    store.state = bump(store.state);
  } else {
    store.questions = reindex(questions);
    store.sourceName = sourceName;
    moveToQuestion(store, 0, scores);
  }

  saveQuestionPack(store.sourceName, store.questions);
  return store.state;
}

export function installMarkdownPack(
  markdown: string,
  sourceName: string,
  mode: "replace" | "append",
) {
  return installQuestionPack(parseQuestionsMarkdown(markdown), sourceName, mode);
}

export function restoreBundledSurvey() {
  const questions = loadQuestionsFromFile(BUNDLED_SURVEY_PATH);
  clearSavedQuestionPack();
  const store = getStore();
  store.questions = questions;
  store.sourceName = "Prieskum 5 proti 5";
  const scores = {
    team1Name: store.state.team1Name,
    team2Name: store.state.team2Name,
    team1Score: store.state.team1Score,
    team2Score: store.state.team2Score,
  };
  moveToQuestion(store, 0, scores);
  return store.state;
}

export function loadBundledFeud() {
  const questions = loadQuestionsFromFile(BUNDLED_FEUD_PATH);
  return installQuestionPack(questions, "Family Feud sezóna 26", "replace");
}

export function getState() {
  return getStore().state;
}

export function roundPoints(state: GameState, questions: Question[]) {
  const question = questions[state.questionIndex];
  if (!question) return 0;
  return question.answers.reduce((sum, answer, index) => {
    return sum + (state.revealed[index] ? answer.points : 0);
  }, 0);
}

function bump(state: GameState): GameState {
  return { ...state, revision: state.revision + 1 };
}

function moveToQuestion(
  store: GlobalGame,
  index: number,
  keepScores: Pick<GameState, "team1Name" | "team2Name" | "team1Score" | "team2Score">,
) {
  const nextIndex = Math.min(Math.max(index, 0), store.questions.length - 1);
  const question = store.questions[nextIndex];
  store.state = bump({
    ...createState(store.questions, nextIndex),
    ...keepScores,
    revealed: emptyRevealed(question.answers.length),
    revision: store.state.revision,
  });
}

export function applyAction(action: GameAction): GameState {
  const store = getStore();
  const { questions } = store;
  const current = store.state;
  const question = questions[current.questionIndex];
  const scores = {
    team1Name: current.team1Name,
    team2Name: current.team2Name,
    team1Score: current.team1Score,
    team2Score: current.team2Score,
  };

  switch (action.type) {
    case "next":
      moveToQuestion(store, current.questionIndex + 1, scores);
      break;
    case "prev":
      moveToQuestion(store, current.questionIndex - 1, scores);
      break;
    case "goto":
      moveToQuestion(store, action.index, scores);
      break;
    case "reveal": {
      const revealed = [...current.revealed];
      if (action.answerIndex >= 0 && action.answerIndex < revealed.length) {
        revealed[action.answerIndex] = true;
      }
      store.state = bump({ ...current, revealed });
      break;
    }
    case "hide": {
      const revealed = [...current.revealed];
      if (action.answerIndex >= 0 && action.answerIndex < revealed.length) {
        revealed[action.answerIndex] = false;
      }
      store.state = bump({ ...current, revealed });
      break;
    }
    case "toggle": {
      const revealed = [...current.revealed];
      if (action.answerIndex >= 0 && action.answerIndex < revealed.length) {
        revealed[action.answerIndex] = !revealed[action.answerIndex];
      }
      store.state = bump({ ...current, revealed });
      break;
    }
    case "revealAll":
      store.state = bump({
        ...current,
        revealed: current.revealed.map(() => true),
      });
      break;
    case "hideAll":
      store.state = bump({
        ...current,
        revealed: emptyRevealed(question.answers.length),
      });
      break;
    case "strike":
      store.state = bump({
        ...current,
        strikes: Math.min(3, current.strikes + 1),
      });
      break;
    case "clearStrikes":
      store.state = bump({ ...current, strikes: 0 });
      break;
    case "award": {
      if (current.awardedThisRound) break;
      const points = roundPoints(current, questions);
      store.state = bump({
        ...current,
        team1Score:
          action.team === 1 ? current.team1Score + points : current.team1Score,
        team2Score:
          action.team === 2 ? current.team2Score + points : current.team2Score,
        awardedThisRound: true,
        lastAwardedTo: action.team,
      });
      break;
    }
    case "setName": {
      const name = action.name.slice(0, 24);
      store.state = bump({
        ...current,
        team1Name: action.team === 1 ? name : current.team1Name,
        team2Name: action.team === 2 ? name : current.team2Name,
      });
      break;
    }
    case "adjustScore":
      store.state = bump({
        ...current,
        team1Score:
          action.team === 1
            ? Math.max(0, current.team1Score + action.delta)
            : current.team1Score,
        team2Score:
          action.team === 2
            ? Math.max(0, current.team2Score + action.delta)
            : current.team2Score,
      });
      break;
    case "resetRound":
      store.state = bump({
        ...current,
        revealed: emptyRevealed(question.answers.length),
        strikes: 0,
        awardedThisRound: false,
        lastAwardedTo: 0,
      });
      break;
    case "resetGame":
      store.state = createState(questions);
      break;
    default:
      break;
  }

  return store.state;
}
