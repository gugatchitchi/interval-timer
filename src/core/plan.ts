import type { Template } from './model';

export const GET_READY_SEC = 15;

export type IntervalKind = 'getReady' | 'set' | 'setRest' | 'rest' | 'roundRest';

export interface Interval {
  kind: IntervalKind;
  sec: number;
  /** Exercise name for sets and set rests. */
  exercise?: string;
  /** 1-based set number and set count, for sets and set rests. */
  set?: number;
  sets?: number;
  round: number;
  rounds: number;
}

/**
 * The ordered intervals a run plays: get-ready, then each round's items.
 * No set rest after an exercise's last set, 0s rests are skipped,
 * and nothing plays after the final set.
 */
export function buildPlan(t: Template): Interval[] {
  const rounds = Math.max(1, t.rounds);
  const out: Interval[] = [{ kind: 'getReady', sec: GET_READY_SEC, round: 1, rounds }];
  for (let round = 1; round <= rounds; round++) {
    for (const item of t.items) {
      if (item.type === 'exercise') {
        for (let set = 1; set <= item.sets; set++) {
          out.push({ kind: 'set', sec: item.setSec, exercise: item.name, set, sets: item.sets, round, rounds });
          if (set < item.sets && item.setRestSec > 0) {
            out.push({ kind: 'setRest', sec: item.setRestSec, exercise: item.name, set, sets: item.sets, round, rounds });
          }
        }
      } else if (item.sec > 0) {
        out.push({ kind: 'rest', sec: item.sec, round, rounds });
      }
    }
    if (round < rounds && t.roundRestSec > 0) {
      out.push({ kind: 'roundRest', sec: t.roundRestSec, round, rounds });
    }
  }
  while (out.length > 0 && out[out.length - 1].kind !== 'set') out.pop();
  return out;
}

export function totalSec(t: Template): number {
  return buildPlan(t).reduce((sum, i) => sum + i.sec, 0);
}

/** Label shown and spoken for an interval. */
export function intervalTitle(i: Interval): string {
  switch (i.kind) {
    case 'getReady': return 'Get ready';
    case 'set': return i.exercise || 'Exercise';
    case 'setRest': return 'Rest';
    case 'rest': return 'Rest';
    case 'roundRest': return 'Round rest';
  }
}
