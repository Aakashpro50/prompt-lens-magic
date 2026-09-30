# PromptLens — Audit & Re-polish Plan

## Audit: bugs found
1. **Recent chip uses wrong model/style** — clicking a history chip generates with the *previously selected* model/style, not the saved one (state updates too late).
2. **Recent list disappears** once results are on screen — can't jump between past ideas without reloading.
3. **Style is labelled "optional" but can't be turned off** — Cinematic is always forced.
4. **Enter key fires while typing Hindi/other keyboards** (IME composition) — can trigger half-typed generates.
5. **Accessibility gaps** — dice button has no label, model/style buttons don't announce selected state, no visible keyboard focus ring on chips.
6. **Copy fallback** ignores failure silently — user sees "Copied!" even if copy failed.

## What to improve
- Selected model/style saved in browser, so returning users keep their setup.
- Results header showing the idea + model used, with a **Regenerate** button (fresh variations).
- **Copy all 4 prompts** button.
- Small badge per card: angle label (Close-up / Wide / Twist / Emotional) for quick scanning.
- Recent chips show a tiny model tag, plus a "Clear" link.
- Surprise me: auto-generates immediately (one tap instead of two).
- Skeleton cards while loading instead of an empty gap; smooth scroll to results.
- Subtle toast on copy for mobile users.

## Visual polish
- Tighter mobile spacing, sticky Generate button on small screens.
- Stronger card hierarchy: idea in display serif, prompt block with scroll cap + fade.
- Footer with Hinglish sign-off and short "how to use" hint.

## Technical details
- History click: pass model/style directly into `generate()` instead of relying on state.
- Style becomes nullable (`None`); server validator + template engine accept it.
- `onKeyDown` checks `e.nativeEvent.isComposing`.
- Add `aria-pressed`, `aria-label`, `focus-visible` rings.
- Persist `{model, style}` under a new localStorage key, read in `useEffect`.
- Regenerate passes a variation seed to the AI prompt for different results.
