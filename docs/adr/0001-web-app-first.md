# 0001: Build as a web app first, not a native iOS app

**Status:** accepted, 2026-11-02

## Context
Guga wants the timer on their iPhone without paying $99/yr for the Apple Developer Program. Free native builds stop working after 7 days and must be re-installed from a Mac with Xcode.

## Decision
Build a Home Screen web app. Revisit native if web limits become a major issue.

## Consequences
- Never expires; no Mac or Xcode; Claude can build and test it end to end; free hosting.
- Lost vs native: cues while locked or in another app, lock-screen countdown (Live Activity), lock-screen controls, reliable music ducking.
- Mitigation: keep the screen awake while running; auto-pause if the page is hidden so no cues are missed.
- Keep timer logic in plain, UI-free code so it could be ported to Swift later.
