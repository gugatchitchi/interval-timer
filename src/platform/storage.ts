import { sanitizeTemplate, type Template } from '../core/model';

const KEY = 'interval-timer:v1';

export interface Settings {
  voice: boolean;
}

interface Saved {
  version: 1;
  templates: Template[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = { voice: true };

export function load(): { templates: Template[] | null; settings: Settings } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { templates: null, settings: DEFAULT_SETTINGS };
    const data = JSON.parse(raw) as Partial<Saved>;
    const templates = Array.isArray(data.templates)
      ? data.templates.map(sanitizeTemplate).filter((t): t is Template => t !== null)
      : null;
    return { templates, settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) } };
  } catch {
    return { templates: null, settings: DEFAULT_SETTINGS };
  }
}

export function save(templates: Template[], settings: Settings): void {
  try {
    const data: Saved = { version: 1, templates, settings };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: nothing useful to do here.
  }
}

/** Ask the browser not to evict our data. */
export function requestPersistence(): void {
  navigator.storage?.persist?.().catch(() => {});
}

export function exportJson(templates: Template[]): string {
  return JSON.stringify({ app: 'interval-timer', version: 1, templates }, null, 2);
}

/** Parses an exported file. Throws with a readable message if it isn't one. */
export function parseImport(text: string): Template[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a templates backup (not valid JSON).");
  }
  const list = (data as { templates?: unknown })?.templates;
  if (!Array.isArray(list)) throw new Error('No templates found in that file.');
  const templates = list.map(sanitizeTemplate).filter((t): t is Template => t !== null);
  if (templates.length === 0) throw new Error('No valid templates found in that file.');
  return templates;
}
