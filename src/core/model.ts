// Domain model. Terms follow GLOSSARY.md.

export interface ExerciseBlock {
  id: string;
  type: 'exercise';
  name: string;
  sets: number;
  setSec: number;
  setRestSec: number;
}

export interface RestBlock {
  id: string;
  type: 'rest';
  sec: number;
}

export type Item = ExerciseBlock | RestBlock;

export interface Template {
  id: string;
  name: string;
  rounds: number;
  roundRestSec: number;
  items: Item[];
}

export const DEFAULT_REST_BLOCK_SEC = 60;

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function newExercise(name: string): ExerciseBlock {
  return { id: newId(), type: 'exercise', name, sets: 3, setSec: 30, setRestSec: 15 };
}

export function newRest(sec = DEFAULT_REST_BLOCK_SEC): RestBlock {
  return { id: newId(), type: 'rest', sec };
}

export function newTemplate(): Template {
  return {
    id: newId(),
    name: 'New workout',
    rounds: 1,
    roundRestSec: 60,
    items: [newExercise('Exercise 1'), newRest()],
  };
}

/** Adding an exercise also adds a rest block after it. */
export function withExerciseAdded(t: Template): { template: Template; exercise: ExerciseBlock } {
  const count = t.items.filter((i) => i.type === 'exercise').length;
  const exercise = newExercise(`Exercise ${count + 1}`);
  return { template: { ...t, items: [...t.items, exercise, newRest()] }, exercise };
}

export function duplicate(t: Template): Template {
  return {
    ...structuredClone(t),
    id: newId(),
    name: `${t.name} copy`,
    items: t.items.map((i) => ({ ...i, id: newId() })),
  };
}

const int = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback;
  return Math.min(max, Math.max(min, n));
};
const str = (v: unknown, fallback: string): string => (typeof v === 'string' ? v.slice(0, 80) : fallback);

/** Turns untrusted data (storage, imported file) into a valid Template, or null. */
export function sanitizeTemplate(raw: unknown): Template | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.items)) return null;
  const items: Item[] = [];
  for (const it of r.items) {
    if (!it || typeof it !== 'object') continue;
    const i = it as Record<string, unknown>;
    if (i.type === 'exercise') {
      items.push({
        id: str(i.id, newId()) || newId(),
        type: 'exercise',
        name: str(i.name, 'Exercise'),
        sets: int(i.sets, 1, 99, 1),
        setSec: int(i.setSec, 1, 3599, 30),
        setRestSec: int(i.setRestSec, 0, 3599, 0),
      });
    } else if (i.type === 'rest') {
      items.push({ id: str(i.id, newId()) || newId(), type: 'rest', sec: int(i.sec, 0, 3599, 0) });
    }
  }
  return {
    id: str(r.id, newId()) || newId(),
    name: str(r.name, 'Workout'),
    rounds: int(r.rounds, 1, 99, 1),
    roundRestSec: int(r.roundRestSec, 0, 3599, 0),
    items,
  };
}
