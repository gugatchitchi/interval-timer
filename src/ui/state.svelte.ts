import type { Template } from '../core/model';
import { load, save, type Settings } from '../platform/storage';
import { sampleTemplates } from './samples';
import { unlockAudio } from '../platform/audio';

const saved = load();

export const app = $state<{
  view: 'list' | 'edit' | 'timer';
  editingId: string | null;
  runningId: string | null;
  templates: Template[];
  settings: Settings;
}>({
  view: 'list',
  editingId: null,
  runningId: null,
  templates: saved.templates ?? sampleTemplates(),
  settings: saved.settings,
});

export function persist(): void {
  save($state.snapshot(app.templates) as Template[], $state.snapshot(app.settings));
}

export function openEditor(id: string): void {
  app.editingId = id;
  app.view = 'edit';
  window.scrollTo(0, 0);
}

export function startTemplate(id: string): void {
  unlockAudio(); // must run inside the tap, or iOS blocks later cues
  app.runningId = id;
  app.view = 'timer';
}

export function goList(): void {
  app.view = 'list';
  app.editingId = null;
  app.runningId = null;
}

// Wheel picker: one shared sheet, opened from anywhere.
export type PickerRequest =
  | { kind: 'duration'; title: string; value: number; min?: number; onDone: (sec: number) => void }
  | { kind: 'count'; title: string; value: number; min?: number; max?: number; onDone: (n: number) => void };

export const picker = $state<{ req: PickerRequest | null }>({ req: null });

export function openPicker(req: PickerRequest): void {
  picker.req = req;
}
