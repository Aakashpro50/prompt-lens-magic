import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, CopyCheck, Dices, History, RefreshCw, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";

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
  style: StyleName | null;
}

interface Settings {
  model: ModelId;
  style: StyleName | null;
}

const HISTORY_KEY = "promptlens-history";
const SETTINGS_KEY = "promptlens-settings";
const ANGLE_LABELS = ["Close-up", "Wide shot", "Creative twist", "Emotional"];

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — ignore
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function PromptLens() {
  const [idea, setIdea] = useState("");
  const [model, setModel] = useState<ModelId>("gpt-image");
  const [style, setStyle] = useState<StyleName | null>("Cinematic");
  const [results, setResults] = useState<IdeaPrompt[]>([]);
  const [lastRun, setLastRun] = useState<{ idea: string; model: ModelId; style: StyleName | null; variation: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const h = readJSON<HistoryEntry[]>(HISTORY_KEY);
    if (Array.isArray(h)) setHistory(h.slice(0, 8));
    const s = readJSON<Settings>(SETTINGS_KEY);
    if (s && MODELS.some((m) => m.id === s.model)) {
      setModel(s.model);
      setStyle(s.style && (STYLES as readonly string[]).includes(s.style) ? s.style : null);
    }
  }, []);

  useEffect(() => {
    writeJSON(SETTINGS_KEY, { model, style });
  }, [model, style]);

  const activeModel = MODELS.find((m) => m.id === model)!;

  const saveHistory = (entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev.filter((h) => h.idea.toLowerCase() !== entry.idea.toLowerCase())].slice(0, 8);
      writeJSON(HISTORY_KEY, next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    writeJSON(HISTORY_KEY, []);
  };

  const generate = async (opts?: { idea?: string; model?: ModelId; style?: StyleName | null; variation?: number }) => {
    const finalIdea = (opts?.idea ?? idea).trim();
    const finalModel = opts?.model ?? model;
    const finalStyle = opts?.style !== undefined ? opts.style : style;
    const variation = opts?.variation ?? 0;
    if (!finalIdea || loading) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "auto", block: "start" }), 50);
    try {
      const res = await generatePrompts({
        data: { idea: finalIdea, model: finalModel, style: finalStyle, variation },
      });
      setResults(res.ideas);
      setLastRun({ idea: finalIdea, model: finalModel, style: finalStyle, variation });
      saveHistory({ idea: finalIdea, model: finalModel, style: finalStyle });
    } catch {
      setError("Kuch gadbad ho gayi — generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const surprise = () => {
    const options = SURPRISE_IDEAS.filter((s) => s !== idea);
    const pick = options[Math.floor(Math.random() * options.length)]!;
    setIdea(pick);
    toast.success(`Idea mil gaya: "${pick}" — ab Generate dabao!`);
  };

  const copyPrompt = async (text: string, index: number | "all") => {
    const ok = await copyText(text);
    if (!ok) {
      toast.error("Copy nahi hua — please select and copy manually.");
      return;
    }
    toast.success(index === "all" ? "All 4 prompts copied!" : "Prompt copied!");
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1800);
  };

  const lastModel = lastRun ? MODELS.find((m) => m.id === lastRun.model)! : null;
  const showResultsArea = loading || results.length > 0;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-10 sm:pb-24 sm:pt-16">
        {/* Header */}
        <header className="animate-fade-up">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
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
        <section className="mt-8 sm:mt-10">
          <label htmlFor="idea" className="sr-only">
            Your idea
          </label>
          <div className="flex gap-2">
            <input
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) void generate();
              }}
              placeholder='e.g. "rainy street", "ganesh ji", "street food"'
              maxLength={120}
              enterKeyHint="go"
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
            />
            <button
              onClick={surprise}
              disabled={loading}
              aria-label="Surprise me with a random idea"
              title="Surprise me"
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-input bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40 ${focusRing}`}
            >
              <Dices className="h-5 w-5" aria-hidden />
            </button>
          </div>

          {/* Model picker */}
          <div className="mt-6">
            <p id="model-label" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Image model
            </p>
            <div role="group" aria-labelledby="model-label" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  aria-pressed={model === m.id}
                  className={`min-h-14 rounded-xl border px-3 py-2.5 text-left transition-colors ${focusRing} ${
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
              <Wand2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
              {activeModel.tip}
            </p>
          </div>

          {/* Style picker */}
          <div className="mt-6">
            <p id="style-label" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Style <span className="normal-case tracking-normal">(optional — tap again to clear)</span>
            </p>
            <div role="group" aria-labelledby="style-label" className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle((cur) => (cur === s ? null : s))}
                  aria-pressed={style === s}
                  className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${focusRing} ${
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

          {/* Generate — sticky on mobile */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-3 sm:static sm:mt-8 sm:border-0 sm:p-0">
            <button
              onClick={() => void generate()}
              disabled={!idea.trim() || loading}
              className={`mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Soch rahe hain…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Generate prompts
                </>
              )}
            </button>
          </div>
        </section>

        {/* History */}
        {history.length > 0 && (
          <section className="mt-10 animate-fade-up" aria-label="Recent ideas">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <History className="h-3.5 w-3.5" aria-hidden /> Recent
              </p>
              <button
                onClick={clearHistory}
                className={`flex items-center gap-1 rounded text-xs text-muted-foreground hover:text-foreground ${focusRing}`}
              >
                <X className="h-3 w-3" aria-hidden /> Clear
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {history.map((h) => {
                const hm = MODELS.find((m) => m.id === h.model);
                return (
                  <button
                    key={h.idea}
                    disabled={loading}
                    onClick={() => {
                      setIdea(h.idea);
                      setModel(h.model);
                      setStyle(h.style);
                      window.scrollTo({ top: 0, behavior: "auto" });
                    }}
                    className={`flex min-h-9 items-center gap-2 rounded-full border border-input bg-card px-3.5 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50 ${focusRing}`}
                  >
                    {h.idea}
                    {hm && <span className="text-[10px] uppercase tracking-wider text-primary">{hm.short}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <p role="alert" className="mt-8 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Results */}
        <section ref={resultsRef} aria-live="polite" aria-busy={loading} className="scroll-mt-6">
          {showResultsArea && (
            <div className="mt-12 space-y-5">
              {results.length > 0 && lastRun && lastModel && (
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">4 ideas for</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">“{lastRun.idea}”</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lastModel.name} · {lastRun.style ?? "Any style"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        void generate({ ...lastRun, variation: lastRun.variation + 1 })
                      }
                      className={`flex min-h-9 items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 ${focusRing}`}
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Regenerate
                    </button>
                    <button
                      onClick={() =>
                        void copyPrompt(
                          results.map((r, i) => `${i + 1}. ${r.idea}\n${r.prompt}`).join("\n\n"),
                          "all",
                        )
                      }
                      className={`flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${focusRing} ${
                        copiedIndex === "all"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-card text-foreground hover:border-primary/40"
                      }`}
                    >
                      {copiedIndex === "all" ? (
                        <CopyCheck className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {copiedIndex === "all" ? "Copied!" : "Copy all"}
                    </button>
                  </div>
                </div>
              )}

              {loading &&
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5" aria-hidden>
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="mt-3 h-5 w-3/4 rounded bg-muted" />
                    <div className="mt-4 h-24 rounded-xl bg-muted/60" />
                  </div>
                ))}

              {results.map((item, i) => (
                <article
                  key={`${lastRun?.variation}-${i}`}
                  className="card-lift animate-fade-up rounded-2xl border border-border bg-card p-5 [content-visibility:auto] [contain-intrinsic-size:auto_320px]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">
                        {String(i + 1).padStart(2, "0")} · {ANGLE_LABELS[i] ?? "Idea"}
                      </span>
                      <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-foreground">
                        {item.idea}
                      </h3>
                    </div>
                    <button
                      onClick={() => void copyPrompt(item.prompt, i)}
                      aria-label={`Copy prompt ${i + 1}`}
                      className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${focusRing} ${
                        copiedIndex === i
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-secondary text-secondary-foreground hover:border-primary/40"
                      }`}
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-code p-4 font-mono text-[13px] leading-relaxed text-code-foreground">
                    {item.prompt}
                  </pre>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-center text-xs leading-relaxed text-muted-foreground">
          <p>Tip: copy a prompt, paste it in your image tool, and tweak one detail at a time.</p>
          <p className="mt-2">PromptLens · Banaya gaya pyaar se · Free forever, no accounts</p>
        </footer>
      </div>
    </div>
  );
}
