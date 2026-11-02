import type { Interval } from './plan';

/**
 * A run of a plan. Time comes from a clock passed in (ms), never from counting ticks,
 * so the timer can't drift and is easy to test.
 */
export interface Run {
  plan: Interval[];
  index: number;
  status: 'running' | 'paused' | 'done';
  /** Clock time when the current interval ends (running only). */
  endsAt: number;
  /** Ms left in the current interval (paused only). */
  pausedLeftMs: number;
}

export type RunEvent = { type: 'intervalStart'; index: number } | { type: 'done' };

export interface Step {
  run: Run;
  events: RunEvent[];
}

/** Within this many seconds of an interval's start, Back goes to the previous interval. */
export const BACK_RESTART_THRESHOLD_SEC = 3;

export function startRun(plan: Interval[], now: number): Step {
  if (plan.length === 0) {
    return { run: { plan, index: 0, status: 'done', endsAt: now, pausedLeftMs: 0 }, events: [{ type: 'done' }] };
  }
  return {
    run: { plan, index: 0, status: 'running', endsAt: now + plan[0].sec * 1000, pausedLeftMs: 0 },
    events: [{ type: 'intervalStart', index: 0 }],
  };
}

export function msLeft(r: Run, now: number): number {
  if (r.status === 'done') return 0;
  return r.status === 'running' ? Math.max(0, r.endsAt - now) : r.pausedLeftMs;
}

/** Whole seconds shown on screen (rounded up, so 0.2s left shows 1). */
export function secLeft(r: Run, now: number): number {
  return Math.ceil(msLeft(r, now) / 1000);
}

export function totalMsLeft(r: Run, now: number): number {
  return msLeft(r, now) + r.plan.slice(r.index + 1).reduce((s, i) => s + i.sec * 1000, 0);
}

export function pause(r: Run, now: number): Run {
  if (r.status !== 'running') return r;
  return { ...r, status: 'paused', pausedLeftMs: Math.max(0, r.endsAt - now) };
}

export function resume(r: Run, now: number): Run {
  if (r.status !== 'paused') return r;
  return { ...r, status: 'running', endsAt: now + r.pausedLeftMs };
}

/** Advance past any intervals that have ended by `now`. Carries over leftover time. */
export function tick(r: Run, now: number): Step {
  if (r.status !== 'running') return { run: r, events: [] };
  const events: RunEvent[] = [];
  let run = r;
  while (run.status === 'running' && now >= run.endsAt) {
    const next = run.index + 1;
    if (next >= run.plan.length) {
      run = { ...run, status: 'done', pausedLeftMs: 0 };
      events.push({ type: 'done' });
    } else {
      run = { ...run, index: next, endsAt: run.endsAt + run.plan[next].sec * 1000 };
      events.push({ type: 'intervalStart', index: next });
    }
  }
  return { run, events };
}

/** Jump to interval `index` (full length). Keeps running/paused state. */
export function goTo(r: Run, index: number, now: number): Step {
  if (r.status === 'done') return { run: r, events: [] };
  if (index >= r.plan.length) return { run: { ...r, status: 'done', pausedLeftMs: 0 }, events: [{ type: 'done' }] };
  const i = Math.max(0, index);
  const ms = r.plan[i].sec * 1000;
  const run: Run = r.status === 'running' ? { ...r, index: i, endsAt: now + ms } : { ...r, index: i, pausedLeftMs: ms };
  return { run, events: [{ type: 'intervalStart', index: i }] };
}

export function skip(r: Run, now: number): Step {
  return goTo(r, r.index + 1, now);
}

/** Restart the current interval, or go to the previous one if it only just started. */
export function back(r: Run, now: number): Step {
  if (r.status === 'done') return { run: r, events: [] };
  const elapsedSec = r.plan[r.index].sec - msLeft(r, now) / 1000;
  return goTo(r, elapsedSec > BACK_RESTART_THRESHOLD_SEC ? r.index : r.index - 1, now);
}
