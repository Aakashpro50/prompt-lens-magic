# PromptSpark Studio

Build "PromptLens" - a web tool that turns any 1-2 word idea into image ideas plus ready-to-copy prompts for AI image models.



CORE FLOW:

1. User types a short idea (examples: "rainy street", "cinematic portrait", "ganesh ji", "street food").

2. User picks a target image model: GPT Image (ChatGPT), Google Gemini (Nano Banana), Midjourney, or Flux.

3. User optionally picks a style: Photorealistic, Cinematic, Portrait, Product shot, Anime/Illustration, Viral Instagram look.

4. On Generate, show 4 distinct IMAGE IDEAS based on the input - each idea is one line describing a specific, interesting image worth creating (different angles: close-up, wide shot, creative twist, emotional version).

5. Under each idea, show a complete, detailed, ready-to-paste PROMPT written specifically for the selected model's style: natural descriptive language for GPT Image / Gemini / Flux, and Midjourney-style with parameters like --ar 16:9 --style raw when Midjourney is selected. Each prompt gets its own COPY button with a "Copied!" confirmation.

6. Also show a small tip under the model selector: one line about what that model is best at.



EXTRAS:

- A "Surprise me" button that fills a random fun idea.

- Recent generations saved in the browser (localStorage), shown as clickable history chips.

- Pressing Enter triggers Generate.

- Each prompt should include lighting, camera angle, mood and detail keywords - genuinely high quality, not generic filler.



DESIGN:

- Dark, premium editorial look (near-black background, one strong accent color), big clean typography, mobile-first.

- Card layout: idea text on top, prompt in a monospace block below, copy button on the right.

- Small Hindi/Hinglish touches in the UI are welcome (e.g. tagline), but keep the generated prompts in English.

- Fast, single page, no login, no accounts.



TECH: Use your built-in AI generation for ideas and prompts. If that is unavailable, use a strong template engine that combines idea patterns, style modifiers and model-specific phrasing so the output still feels custom to each input.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://prompt-lens-magic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dcd05b17-53fb-4353-b70e-a2c7950e3dfc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
