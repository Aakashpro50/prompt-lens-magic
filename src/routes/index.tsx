import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Dices, History, Sparkles, Wand2 } from "lucide-react";

import { generatePrompts } from "@/lib/generate.functions";
import { MODELS, STYLES, SURPRISE_IDEAS, type ModelId, type StyleName } from "@/lib/models";
import type { IdeaPrompt } from "@/lib/templates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptLens — Idea se image tak" },
      {
        name: "description",
        content:
          "Turn any 1-2 word idea into four image concepts with ready-to-copy prompts for GPT Image, Gemini, Midjourney and Flux.",
      },
      { property: "og:title", content: "PromptLens — Idea se image tak" },
      {
        property: "og:description",
        content:
          "Type a tiny idea, pick your image model, and get four detailed, ready-to-paste prompts. Free, fast, no login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromptLens,
});

interface HistoryEntry {
  idea: string;
  model: ModelId;
  style: StyleName;
}

const HISTORY_KEY = "promptlens-history";

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function PromptLens() {
  const [idea, setIdea] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-image");
  const [style, setStyle] = useState<StyleName>("Cinematic");
  const [results, setResults] = useState<IdeaPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const activeModel = MODELS.find((m) => m.id === model)!;

  const saveHistory = (entry: HistoryEntry) => {
    const next = [entry, ...history.filter((h) => h.idea !== entry.idea)].slice(0, 8);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — ignore
    }
  };

  const generate = async (overrideIdea?: string) => {
    const finalIdea = (overrideIdea ?? idea).trim();
    if (!finalIdea || loading) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await generatePrompts({ data: { idea: finalIdea, model, style } });
      setResults(res.ideas);
      saveHistory({ idea: finalIdea, model, style });
    } catch {
      setError("Kuch gadbad ho gayi — generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const surprise = () => {
    const pick = SURPRISE_IDEAS[Math.floor(Math.random() * SURPRISE_IDEAS.length)]!;
    setIdea(pick);
  };

  const copyPrompt = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-10 sm:pt-16">
        {/* Header */}
        <header className="animate-fade-up">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">PromptLens</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Idea se <span className="text-primary text-glow">image</span> tak.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Type a tiny idea, pick your image model, and get four detailed, ready-to-paste prompts.
            No login, no fuss.
          </p>
        </header>

        {/* Input */}
        <section className="mt-10 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex gap-2">
            <input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void generate();
              }}
              placeholder='e.g. "rainy street", "ganesh ji", "street food"'
              maxLength={120}
              className="h-12 flex-1 rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={surprise}
              title="Surprise me"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Dices className="h-5 w-5" />
            </button>
          </div>

          {/* Model picker */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Image model
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    model === m.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="block text-sm font-semibold">{m.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{m.short}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Wand2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              {activeModel.tip}
            </p>
          </div>

          {/* Style picker */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Style <span className="normal-case tracking-normal">(optional)</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    style === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => void generate()}
            disabled={!idea.trim() || loading}
            className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Soch rahe hain…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate prompts
              </>
            )}
          </button>
        </section>

        {/* History */}
        {history.length > 0 && !loading && results.length === 0 && (
          <section className="mt-10 animate-fade-up">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <History className="h-3.5 w-3.5" /> Recent
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={h.idea}
                  onClick={() => {
                    setIdea(h.idea);
                    setModel(h.model);
                    setStyle(h.style);
                    void generate(h.idea);
                  }}
                  className="rounded-full border border-input bg-card px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {h.idea}
                </button>
              ))}
            </div>
          </section>
        )}

        {error && (
          <p className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section className="mt-12 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              4 ideas for “{idea}” · {activeModel.name} · {style}
            </p>
            {results.map((item, i) => (
              <article
                key={i}
                className="card-lift animate-fade-up rounded-2xl border border-border bg-card p-5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
                    <span className="mr-2 text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                    {item.idea}
                  </h2>
                  <button
                    onClick={() => void copyPrompt(item.prompt, i)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      copiedIndex === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-secondary text-secondary-foreground hover:border-primary/40"
                    }`}
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-code p-4 font-mono text-[13px] leading-relaxed text-code-foreground">
                  {item.prompt}
                </pre>
              </article>
            ))}
          </section>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          PromptLens · Banaya gaya pyaar se · Free forever, no accounts
        </footer>
      </div>
    </div>
  );
}
