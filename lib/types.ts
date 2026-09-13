export type Answer = {
  text: string;
  points: number;
};

export type Question = {
  id: number;
  prompt: string;
  answers: Answer[];
};

export type GameState = {
  questionIndex: number;
  revealed: boolean[];
  strikes: number;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  awardedThisRound: boolean;
  lastAwardedTo: 0 | 1 | 2;
  revision: number;
};

export type AnswerSlot = {
  shown: boolean;
  text?: string;
  points?: number;
};

export type PlayView = {
  role: "play";
  revision: number;
  questionIndex: number;
  totalQuestions: number;
  prompt: string;
  answers: AnswerSlot[];
  strikes: number;
  roundPoints: number;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  awardedThisRound: boolean;
  lastAwardedTo: 0 | 1 | 2;
};

export type AdminQuestionPreview = {
  id: number;
  prompt: string;
};

export type AdminView = {
  role: "admin";
  revision: number;
  questionIndex: number;
  totalQuestions: number;
  prompt: string;
  answers: Answer[];
  revealed: boolean[];
  strikes: number;
  roundPoints: number;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  awardedThisRound: boolean;
  lastAwardedTo: 0 | 1 | 2;
  catalog: AdminQuestionPreview[];
  sourceName: string;
};

export type GameView = PlayView | AdminView;

export type GameAction =
  | { type: "next" }
  | { type: "prev" }
  | { type: "goto"; index: number }
  | { type: "reveal"; answerIndex: number }
  | { type: "hide"; answerIndex: number }
  | { type: "toggle"; answerIndex: number }
  | { type: "revealAll" }
  | { type: "hideAll" }
  | { type: "strike" }
  | { type: "clearStrikes" }
  | { type: "award"; team: 1 | 2 }
  | { type: "setName"; team: 1 | 2; name: string }
  | { type: "adjustScore"; team: 1 | 2; delta: number }
  | { type: "resetGame" }
  | { type: "resetRound" };
