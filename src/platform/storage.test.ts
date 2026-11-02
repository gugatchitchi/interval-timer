import { describe, expect, it } from 'vitest';
import { exportJson, parseImport } from './storage';
import { newTemplate } from '../core/model';

describe('backup', () => {
  it('round-trips templates through export and import', () => {
    const t = newTemplate();
    expect(parseImport(exportJson([t]))).toEqual([t]);
  });
  it('rejects files that are not backups', () => {
    expect(() => parseImport('hello')).toThrow(/not valid JSON/);
    expect(() => parseImport('{"x":1}')).toThrow(/No templates/);
  });
});
