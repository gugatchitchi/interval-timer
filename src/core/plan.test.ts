import { describe, expect, it } from 'vitest';
import { buildPlan, totalSec } from './plan';
import type { Template } from './model';

const ex = (name: string, sets: number, setSec: number, setRestSec: number) =>
  ({ id: name, type: 'exercise', name, sets, setSec, setRestSec }) as const;
const rest = (sec: number) => ({ id: 'r' + sec, type: 'rest', sec }) as const;
const tpl = (items: Template['items'], rounds = 1, roundRestSec = 0): Template => ({ id: 't', name: 'T', rounds, roundRestSec, items });

const kinds = (t: Template) => buildPlan(t).map((i) => `${i.kind}:${i.sec}`);

describe('buildPlan', () => {
  it('starts with a 15s get-ready and alternates sets and set rests, with no rest after the last set', () => {
    expect(kinds(tpl([ex('Squats', 3, 60, 30)]))).toEqual(['getReady:15', 'set:60', 'setRest:30', 'set:60', 'setRest:30', 'set:60']);
  });

  it('plays rest blocks between exercises and drops a trailing rest block', () => {
    expect(kinds(tpl([ex('A', 2, 30, 10), rest(60), ex('B', 1, 20, 5), rest(60)]))).toEqual([
      'getReady:15', 'set:30', 'setRest:10', 'set:30', 'rest:60', 'set:20',
    ]);
  });

  it('skips 0s rests and 0s set rests, so exercises play back to back', () => {
    expect(kinds(tpl([ex('A', 2, 30, 0), rest(0), ex('B', 1, 20, 0)]))).toEqual(['getReady:15', 'set:30', 'set:30', 'set:20']);
  });

  it('repeats the list per round with a round rest between rounds only', () => {
    const p = buildPlan(tpl([ex('A', 1, 30, 0), rest(45)], 2, 90));
    expect(p.map((i) => `${i.kind}:${i.round}`)).toEqual(['getReady:1', 'set:1', 'rest:1', 'roundRest:1', 'set:2']);
  });

  it('labels sets with their number and count', () => {
    const sets = buildPlan(tpl([ex('Squats', 2, 30, 10)])).filter((i) => i.kind === 'set');
    expect(sets.map((s) => `${s.exercise} ${s.set}/${s.sets}`)).toEqual(['Squats 1/2', 'Squats 2/2']);
  });

  it('returns an empty plan when there are no sets', () => {
    expect(buildPlan(tpl([rest(60)]))).toEqual([]);
    expect(totalSec(tpl([]))).toBe(0);
  });

  it('totals all interval lengths', () => {
    expect(totalSec(tpl([ex('A', 3, 45, 30), rest(60), ex('B', 2, 60, 30)]))).toBe(15 + (45 * 3 + 30 * 2) + 60 + (60 * 2 + 30));
  });
});
