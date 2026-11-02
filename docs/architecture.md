# Workout Timer: architecture (agreed 2026-11-02)

## Shape
A static web app: HTML, CSS and JS files served from free hosting. No server, no accounts.

```
src/
  core/        pure logic, no browser APIs, fully unit tested
    model.ts       Template, Exercise block, Rest block types + validation
    plan.ts        Template -> ordered list of Intervals (get-ready, sets, rests, rounds)
    engine.ts      run state machine: play, pause, skip, back, finish; time from the clock
    cues.ts        which cue fires at which second (1-min marks, 30, 15, 10, 5..1, interval start)
  platform/    thin wrappers around browser features
    storage.ts     save/load templates (localStorage, versioned JSON)
    audio.ts       beeps (Web Audio) + voice (speechSynthesis)
    wakelock.ts    keep screen on; auto-pause when the page is hidden
  ui/          screens and components (list, editor, sheets, wheel picker, timer E)
```

- `core/` never touches the browser, so the timer rules can be tested fast and reused if we ever go native.
- The engine stores "interval ends at clock time X", never "count down by 1 every second", so it can't drift.

## Tooling (recommended)
- **TypeScript + Vite** for building; **Svelte** for the UI (small, little boilerplate).
- **Vitest** unit tests for `core/` and backup parsing. Browser smoke tests are run by hand for now.
- **SortableJS** for drag and drop.
- **PWA**: web manifest + a small hand-written service worker (`public/sw.js`) so it opens offline from the Home Screen and has an app icon. Fonts are bundled (no Google Fonts at runtime).

## Hosting and updates
- GitHub repo -> GitHub Actions runs tests and deploys to **GitHub Pages** on every merge to main.
- Updating the app on the phone: just reopen it (the service worker fetches the new version).

## Known risks to check early on a real iPhone
- iPhone's silent switch may mute beeps from web pages.
- Voice quality and speed differ by iOS voice; pick a good default.
- Storage: Home Screen web apps keep their data, but a backup (export/import JSON) is cheap insurance.
