# Workout Timer: requirements (v1, signed off 2026-11-02)

Terms are defined in [GLOSSARY.md](../GLOSSARY.md).

## Platform
- **Web app** (installable to the iPhone Home Screen from Safari), chosen 2026-11-02 to avoid the 7-day expiry of free native builds. See [ADR 0001](./adr/0001-web-app-first.md).
- Hosted for free (e.g. GitHub Pages). No App Store, no Xcode.
- Templates stored on the phone only (browser storage). No account, no cloud.
- Revisit native iOS if the web limits below become a major issue.

## Screens
1. **Template list + editor**
2. **Timer**

## Template list
- Create, edit, duplicate, delete.
- A play button on each row starts the template.
- A template can't be edited while it is running.

## Template editor
- Name, round count (default 1), rest between rounds.
- Ordered list of Exercise blocks and Rest blocks, rearranged by drag and drop.
- Exercise block: name, set count, set duration, set rest (same for every set).
- Rest block: its own duration.
- Adding an Exercise block auto-inserts a Rest block after it (deletable/movable).
- Durations entered with a minutes:seconds wheel picker; set count with +/- buttons.

## Playback order
1. 15s get-ready countdown.
2. Each item in order. Within an Exercise block: set, set rest, set, ..., last set (no set rest after the last set).
3. Rest blocks of 0s are skipped; exercises with no Rest block between them play back to back.
4. If rounds > 1: between-rounds rest, then the list again.
5. Done screen with total time, then back to the list. No history in v1.

## Timer screen
- Big countdown, exercise name, "Set 2/3", "Round 1/2", next item, total time left.
- Colors (refine in prototype): get-ready yellow, sets red, rests blue, done green.
- Controls: play/pause (largest), skip forward, go back, stop.
  - Skip: next interval, including rests.
  - Back: restart current interval if >3s in, otherwise previous interval.
  - Stop: pauses and asks for confirmation before ending.
- Screen stays awake while running.

## Cues
- Remaining-time cues: every whole minute, then 30s, 15s, 10s, 5, 4, 3, 2, 1.
- Same cues for sets and rests.
- Start of each interval announced ("Squats, set 2", "Rest 30 seconds", "Done").
- Voice by default using iOS built-in text-to-speech (no recordings). Setting to switch to beeps only; interval starts use a distinct long beep.
- Background music is lowered briefly during cues, not stopped.
- No haptics in v1.

## Locked phone / background (web-app limits accepted)
- Intended use: screen stays on during the workout (wake lock).
- If the phone locks or the app is left (including an incoming call), the timer auto-pauses; user resumes manually. (A web page cannot tell a call from a lock.)
- No lock-screen countdown, no lock-screen controls (native-only features, dropped).
- Lowering background music during cues is best effort; may not work on iOS.

## Out of scope for v1
- Haptics, workout history, cloud sync, native iOS app, App Store release.

## UI decisions (prototype)
- Timer screen: style **E** (2026-11-02): D layout (big condensed countdown, outline when paused, interval card strip, position counter, total left) with A colours and animation (flat full-screen phase colours, breathing concentric circles, faster pulse in last 5s, cream when paused).
- Template list: design **1 · Timeline** list (2026-11-02): big full-width colour cards with breathing circles, name, summary, total time, white play button; dashed "+ New workout" card.
- Template editor: design **1 · Timeline** (2026-11-02): orange exercise blocks (name, sets × length, rest, mini set bar) and blue rest pills; drag ≡ to reorder; tap exercise → bottom sheet; durations via min:sec wheel picker; sticky Start button.
- Prototype: throwaway, on the `prototype/ui` branch.
