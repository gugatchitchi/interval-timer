import { describe, expect, it } from 'vitest';
import { back, msLeft, pause, resume, secLeft, skip, startRun, tick, totalMsLeft } from './engine';
import type { Interval } from './plan';

const iv = (kind: Interval['kind'], sec: number): Interval => ({ kind, sec, round: 1, rounds: 1 });
const plan = [iv('getReady', 15), iv('set', 30), iv('setRest', 10), iv('set', 30)];

describe('engine', () => {
  it('starts at the first interval and counts down from the clock', () => {
    const { run, events } = startRun(plan, 0);
    expect(events).toEqual([{ type: 'intervalStart', index: 0 }]);
    expect(secLeft(run, 0)).toBe(15);
    expect(secLeft(run, 14_200)).toBe(1);
  });

  it('advances to the next interval and carries leftover time', () => {
    const { run } = startRun(plan, 0);
    const s = tick(run, 15_500);
    expect(s.events).toEqual([{ type: 'intervalStart', index: 1 }]);
    expect(s.run.index).toBe(1);
    expect(msLeft(s.run, 15_500)).toBe(29_500);
  });

  it('catches up across several intervals after a long gap, then finishes', () => {
    const { run } = startRun(plan, 0);
    const s = tick(run, 56_000);
    expect(s.run.index).toBe(3);
    const end = tick(s.run, 85_000);
    expect(end.run.status).toBe('done');
    expect(end.events).toEqual([{ type: 'done' }]);
  });

  it('pause freezes the time left and resume continues from it', () => {
    let { run } = startRun(plan, 0);
    run = pause(run, 5_000);
    expect(secLeft(run, 60_000)).toBe(10);
    expect(tick(run, 60_000).events).toEqual([]);
    run = resume(run, 60_000);
    expect(secLeft(run, 61_000)).toBe(9);
  });

  it('skip moves to the next interval at full length, including rests', () => {
    let { run } = startRun(plan, 0);
    run = skip(run, 3_000).run;
    run = skip(run, 4_000).run;
    expect(run.index).toBe(2);
    expect(secLeft(run, 4_000)).toBe(10);
  });

  it('skip on the last interval finishes the run', () => {
    let { run } = startRun(plan, 0);
    run = skip(skip(skip(run, 0).run, 0).run, 0).run;
    const s = skip(run, 0);
    expect(s.run.status).toBe('done');
  });

  it('back restarts the current interval after 3s, else goes to the previous one', () => {
    let { run } = startRun(plan, 0);
    run = skip(run, 0).run; // set 1 starts at t=0
    expect(back(run, 5_000).run.index).toBe(1);
    expect(secLeft(back(run, 5_000).run, 5_000)).toBe(30);
    expect(back(run, 2_000).run.index).toBe(0);
  });

  it('back at the first interval restarts it', () => {
    const { run } = startRun(plan, 0);
    expect(back(run, 1_000).run.index).toBe(0);
  });

  it('skip and back keep a paused run paused', () => {
    let { run } = startRun(plan, 0);
    run = pause(run, 1_000);
    run = skip(run, 2_000).run;
    expect(run.status).toBe('paused');
    expect(secLeft(run, 99_000)).toBe(30);
  });

  it('reports total time left across remaining intervals', () => {
    const { run } = startRun(plan, 0);
    expect(totalMsLeft(run, 5_000)).toBe(10_000 + 30_000 + 10_000 + 30_000);
  });

  it('an empty plan is done immediately', () => {
    expect(startRun([], 0).run.status).toBe('done');
  });
});
