import { newId, type Template } from '../core/model';

/** Example templates shown on first launch. Editable and deletable like any other. */
export function sampleTemplates(): Template[] {
  const ex = (name: string, sets: number, setSec: number, setRestSec: number) => ({ id: newId(), type: 'exercise' as const, name, sets, setSec, setRestSec });
  const rest = (sec: number) => ({ id: newId(), type: 'rest' as const, sec });
  return [
    { id: newId(), name: 'Leg day', rounds: 1, roundRestSec: 60, items: [ex('Squats', 3, 45, 30), rest(60), ex('Lunges', 3, 40, 20), rest(60), ex('Wall sit', 2, 60, 30)] },
    { id: newId(), name: 'Core circuit', rounds: 3, roundRestSec: 90, items: [ex('Plank', 1, 45, 0), rest(15), ex('Dead bug', 1, 40, 0), rest(15), ex('Side plank', 2, 30, 10)] },
  ];
}
