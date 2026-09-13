import fs from "node:fs";
import path from "node:path";
import type { Answer, Question } from "./types";

const ANSWERS_PER_QUESTION = 5;

function displayText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLocaleUpperCase("sk-SK") + trimmed.slice(1);
}

function tableCells(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return null;
  return trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseSurveyTableMarkdown(markdown: string): Question[] {
  const grouped = new Map<number, { prompt: string; answers: Answer[] }>();

  for (const rawLine of markdown.split(/\r?\n/)) {
    const cells = tableCells(rawLine);
    if (!cells || cells.length < 4) continue;
    const id = Number(cells[0]);
    const prompt = cells[1];
    const text = displayText(cells[2]);
    const points = Number(cells[3].replace(/[^\d]/g, ""));
    if (!id || !prompt || !text || Number.isNaN(points)) continue;
    if (/^otázka$/i.test(prompt) || /^-+$/.test(cells[0])) continue;

    const existing = grouped.get(id);
    if (!existing) {
      grouped.set(id, { prompt, answers: [{ text, points }] });
      continue;
    }

    const duplicate = existing.answers.find(
      (answer) =>
        answer.text.toLocaleLowerCase("sk-SK") === text.toLocaleLowerCase("sk-SK"),
    );
    if (duplicate) {
      duplicate.points += points;
      continue;
    }
    existing.answers.push({ text, points });
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, question]) => ({
      id,
      prompt: question.prompt,
      answers: question.answers
        .sort((a, b) => b.points - a.points)
        .slice(0, ANSWERS_PER_QUESTION),
    }))
    .filter((question) => question.answers.length > 0);
}

function parseFamilyFeudMarkdown(markdown: string): Question[] {
  const blocks = markdown.split(/^###\s+/m).slice(1);
  const questions: Question[] = [];

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    const heading = (lines[0] ?? "").trim();
    const headingMatch = heading.match(/^(\d+)[.)]\s*(.+)$/);
    const id = headingMatch ? Number(headingMatch[1]) : questions.length + 1;
    const englishPrompt = (headingMatch ? headingMatch[2] : heading).trim();

    let czechPrompt = "";
    for (const line of lines) {
      const cz = line.match(/^\s*(?:\*\*)?CZ(?:\*\*)?:\s*(?:\*\*)?\s*(.+?)\s*(?:\*\*)?\s*$/i);
      if (cz) {
        czechPrompt = cz[1].replace(/\*\*/g, "").trim();
        break;
      }
    }

    const answers: Answer[] = [];
    for (const line of lines) {
      const cells = tableCells(line);
      if (!cells || cells.length < 3) continue;
      if (/^en$/i.test(cells[0]) && /^cz$/i.test(cells[1])) continue;
      if (/^-+/.test(cells[0]) || /^-+/.test(cells[1])) continue;

      const textEn = displayText(cells[0]);
      const textCs = displayText(cells[1] || cells[0]);
      const text = textCs || textEn;
      const points = Number(String(cells[2]).replace(/[^\d]/g, ""));
      if (!text || Number.isNaN(points)) continue;
      answers.push({
        text,
        textEn: textEn || undefined,
        textCs: textCs || undefined,
        points,
      });
    }

    const prompt = czechPrompt || englishPrompt;
    if (!prompt || answers.length === 0) continue;

    questions.push({
      id,
      prompt,
      promptEn: englishPrompt || undefined,
      promptCs: czechPrompt || undefined,
      answers: answers
        .sort((a, b) => b.points - a.points)
        .slice(0, ANSWERS_PER_QUESTION),
    });
  }

  return questions;
}

export function parseQuestionsMarkdown(markdown: string): Question[] {
  const feud = parseFamilyFeudMarkdown(markdown);
  if (feud.length > 0) return feud;
  return parseSurveyTableMarkdown(markdown);
}

export const BUNDLED_SURVEY_PATH = path.join(process.cwd(), "data/questions.md");
export const BUNDLED_FEUD_PATH = path.join(
  process.cwd(),
  "data/family-feud-sezona26.md",
);

function packPath() {
  const dir = path.join(process.cwd(), ".data");
  try {
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "pack.json");
  } catch {
    return path.join("/tmp", "five-against-five-pack.json");
  }
}

type SavedPack = {
  sourceName: string;
  questions: Question[];
};

export function saveQuestionPack(sourceName: string, questions: Question[]) {
  const payload: SavedPack = { sourceName, questions };
  fs.writeFileSync(packPath(), JSON.stringify(payload), "utf8");
}

export function clearSavedQuestionPack() {
  try {
    fs.unlinkSync(packPath());
  } catch {
    // ignore missing pack
  }
}

export function loadQuestionsFromFile(filePath: string): Question[] {
  const markdown = fs.readFileSync(filePath, "utf8");
  const questions = parseQuestionsMarkdown(markdown);
  if (questions.length === 0) {
    throw new Error("V súbore sa nenašli žiadne otázky.");
  }
  return questions;
}

export function loadQuestions(): { sourceName: string; questions: Question[] } {
  try {
    const saved = JSON.parse(fs.readFileSync(packPath(), "utf8")) as SavedPack;
    if (Array.isArray(saved.questions) && saved.questions.length > 0) {
      return {
        sourceName: saved.sourceName || "Nahratá sada",
        questions: saved.questions,
      };
    }
  } catch {
    // fall through to bundled survey
  }

  return {
    sourceName: "Prieskum 5 proti 5",
    questions: loadQuestionsFromFile(BUNDLED_SURVEY_PATH),
  };
}
