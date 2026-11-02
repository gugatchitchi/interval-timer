import { describe, expect, it } from 'vitest';
import { cueAt, spokenCue, spokenStart } from './cues';

describe('cueAt', () => {
  const firing = (len: number) => Array.from({ length: len + 1 }, (_, s) => s).filter((s) => cueAt(s, len)).reverse();

  it('cues at whole minutes, 30, 15, 10, then 5..1', () => {
    expect(firing(150)).toEqual([120, 60, 30, 15, 10, 5, 4, 3, 2, 1]);
  });

  it('never cues at the interval start or at zero', () => {
    expect(firing(30)).toEqual([15, 10, 5, 4, 3, 2, 1]);
    expect(cueAt(0, 30)).toBeNull();
  });

  it('short intervals only get the cues that fit', () => {
    expect(firing(5)).toEqual([4, 3, 2, 1]);
  });

  it('speaks durations and counts', () => {
    expect(spokenCue({ type: 'remaining', sec: 120 })).toBe('2 minutes');
    expect(spokenCue({ type: 'remaining', sec: 60 })).toBe('1 minute');
    expect(spokenCue({ type: 'remaining', sec: 30 })).toBe('30 seconds');
    expect(spokenCue({ type: 'count', n: 3 })).toBe('3');
  });

  it('announces interval starts', () => {
    expect(spokenStart({ kind: 'set', sec: 30, exercise: 'Squats', set: 2, sets: 3, round: 1, rounds: 1 })).toBe('Squats, set 2 of 3');
    expect(spokenStart({ kind: 'setRest', sec: 30, round: 1, rounds: 1 })).toBe('Rest, 30 seconds');
    expect(spokenStart({ kind: 'rest', sec: 90, round: 1, rounds: 1 })).toBe('Rest, 1 minute 30 seconds');
    expect(spokenStart({ kind: 'getReady', sec: 15, round: 1, rounds: 1 })).toBe('Get ready');
  });
});
