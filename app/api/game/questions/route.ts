import {
  installMarkdownPack,
  loadBundledFeud,
  restoreBundledSurvey,
} from "@/lib/game-store";
import { getQuestions, getSourceName, getState } from "@/lib/game-store";
import { toAdminView } from "@/lib/game-views";

export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, max-age=0",
};

const MAX_BYTES = 1_500_000;

function adminView() {
  return toAdminView(getState(), getQuestions(), getSourceName());
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const mode = form.get("mode") === "append" ? "append" : "replace";
      const pack = String(form.get("pack") ?? "");
      if (pack === "survey") {
        restoreBundledSurvey();
        return Response.json(adminView(), { headers: noStore });
      }
      if (pack === "feud") {
        loadBundledFeud();
        return Response.json(adminView(), { headers: noStore });
      }
      const file = form.get("file");
      if (!(file instanceof File)) {
        return Response.json({ error: "Vyberte súbor .md." }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return Response.json({ error: "Súbor je príliš veľký." }, { status: 400 });
      }
      const markdown = await file.text();
      installMarkdownPack(markdown, file.name || "Nahratá sada", mode);
      return Response.json(adminView(), { headers: noStore });
    }

    const body = (await request.json()) as {
      markdown?: string;
      fileName?: string;
      mode?: string;
      pack?: string;
    };

    if (body.pack === "survey") {
      restoreBundledSurvey();
      return Response.json(adminView(), { headers: noStore });
    }
    if (body.pack === "feud") {
      loadBundledFeud();
      return Response.json(adminView(), { headers: noStore });
    }

    const markdown = body.markdown ?? "";
    if (markdown.length > MAX_BYTES) {
      return Response.json({ error: "Súbor je príliš veľký." }, { status: 400 });
    }
    installMarkdownPack(
      markdown,
      body.fileName || "Nahratá sada",
      body.mode === "append" ? "append" : "replace",
    );
    return Response.json(adminView(), { headers: noStore });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Súbor sa nepodarilo načítať.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}
