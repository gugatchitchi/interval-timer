import { intervalTitle, type Interval } from './plan';

export type Cue =
  | { type: 'remaining'; sec: number } // at whole minutes, 30, 15, 10
  | { type: 'count'; n: number }; // 5, 4, 3, 2, 1

/** The cue to play when `sec` seconds are left in an interval of length `intervalSec`, if any. */
export function cueAt(sec: number, intervalSec: number): Cue | null {
  if (sec >= intervalSec || sec <= 0) return null; // the start announcement covers the full length
  if (sec <= 5) return { type: 'count', n: sec };
  if (sec === 10 || sec === 15 || sec === 30 || sec % 60 === 0) return { type: 'remaining', sec };
  return null;
}

export function spokenDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const mins = m === 1 ? '1 minute' : `${m} minutes`;
  if (m === 0) return `${s} seconds`;
  return s === 0 ? mins : `${mins} ${s} seconds`;
}

export function spokenCue(c: Cue): string {
  return c.type === 'count' ? String(c.n) : spokenDuration(c.sec);
}

/** What to say when an interval starts, e.g. "Squats, set 2 of 3" or "Rest, 30 seconds". */
export function spokenStart(i: Interval): string {
  if (i.kind === 'set') return `${intervalTitle(i)}, set ${i.set} of ${i.sets}`;
  if (i.kind === 'getReady') return 'Get ready';
  return `${intervalTitle(i)}, ${spokenDuration(i.sec)}`;
}

export const SPOKEN_DONE = 'Done. Great work';
