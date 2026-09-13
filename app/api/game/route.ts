import { applyAction, getQuestions, getSourceName, getState } from "@/lib/game-store";
import { toAdminView, toPlayView } from "@/lib/game-views";
import type { GameAction } from "@/lib/types";

export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, max-age=0",
};

function isGameAction(value: unknown): value is GameAction {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  const type = (value as { type: unknown }).type;
  return typeof type === "string";
}

function view(role: string | null) {
  const state = getState();
  const questions = getQuestions();
  return role === "admin"
    ? toAdminView(state, questions, getSourceName())
    : toPlayView(state, questions);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return Response.json(view(url.searchParams.get("role")), { headers: noStore });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { role?: string } & Record<string, unknown>;
  const { role, ...action } = body;
  if (!isGameAction(action)) {
    return Response.json({ error: "Neplatná akcia." }, { status: 400 });
  }
  applyAction(action);
  return Response.json(view(typeof role === "string" ? role : "admin"), {
    headers: noStore,
  });
}
