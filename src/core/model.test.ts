import { describe, expect, it } from 'vitest';
import { duplicate, newTemplate, sanitizeTemplate, withExerciseAdded } from './model';

describe('model', () => {
  it('adding an exercise also adds a rest block after it', () => {
    const { template, exercise } = withExerciseAdded(newTemplate());
    expect(template.items.slice(-2).map((i) => i.type)).toEqual(['exercise', 'rest']);
    expect(exercise.name).toBe('Exercise 2');
  });

  it('duplicate gives new ids and a "copy" name', () => {
    const t = newTemplate();
    const d = duplicate(t);
    expect(d.id).not.toBe(t.id);
    expect(d.name).toBe('New workout copy');
    expect(d.items.map((i) => i.id)).not.toEqual(t.items.map((i) => i.id));
  });

  it('sanitize clamps bad numbers and drops unknown items', () => {
    const t = sanitizeTemplate({ name: 'X', rounds: -3, roundRestSec: 'a', items: [{ type: 'exercise', name: 'A', sets: 0, setSec: 1e9, setRestSec: -1 }, { type: 'bogus' }, null] });
    expect(t).not.toBeNull();
    expect(t!.rounds).toBe(1);
    expect(t!.roundRestSec).toBe(0);
    expect(t!.items).toHaveLength(1);
    expect(t!.items[0]).toMatchObject({ sets: 1, setSec: 3599, setRestSec: 0 });
  });

  it('sanitize rejects non-templates', () => {
    expect(sanitizeTemplate(null)).toBeNull();
    expect(sanitizeTemplate({ items: 'no' })).toBeNull();
  });
});
