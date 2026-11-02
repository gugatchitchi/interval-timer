# Interval Timer

A personal workout interval timer for iPhone, built as a Home Screen web app.

Make templates of exercises (sets × duration, rest between sets) and long rests, then run them with a full-screen colour timer and voice or beep cues.

## Docs
- [Requirements](docs/requirements.md)
- [Glossary](GLOSSARY.md)
- [Architecture](docs/architecture.md)
- [ADR 0001: web app first](docs/adr/0001-web-app-first.md)

## Use it on your iPhone
1. Open https://gugatchitchi.github.io/interval-timer/ in **Safari**.
2. Tap Share → **Add to Home Screen**.
3. Open it from the Home Screen icon. It works offline after the first load.

Updates: merge to `main`, then close and reopen the app (sometimes twice) to pick up the new version.

Keep the screen on during a workout. If you lock the phone or switch apps, the timer pauses.

## Develop
```
npm install
npm run dev      # local dev server
npm test         # unit tests (timer logic)
npm run check    # type check
npm run build    # production build in dist/
```

Code layout: `src/core` (pure timer logic, unit tested), `src/platform` (storage, audio, wake lock), `src/ui` (Svelte screens).
