<script lang="ts">
  import { app, openEditor, startTemplate } from './state.svelte';
  import { newTemplate, type Template } from '../core/model';
  import { totalSec } from '../core/plan';
  import { exportJson, parseImport } from '../platform/storage';
  import { mmss } from './format';
  import * as icon from './icons';

  const colours = ['var(--work)', 'var(--rest)', 'var(--done)', 'var(--ready)'];
  let toast = $state('');
  let fileInput: HTMLInputElement;

  const exerciseCount = (t: Template) => t.items.filter((i) => i.type === 'exercise').length;
  function summary(t: Template) {
    const n = exerciseCount(t);
    return `${n} exercise${n === 1 ? '' : 's'}${t.rounds > 1 ? ` · ${t.rounds} rounds` : ''}`;
  }

  function create() {
    const t = newTemplate();
    app.templates.push(t);
    openEditor(t.id);
  }

  function flash(msg: string) {
    toast = msg;
    setTimeout(() => (toast = ''), 3000);
  }

  async function exportAll() {
    const json = exportJson($state.snapshot(app.templates) as Template[]);
    const name = `interval-timer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([json], name, { type: 'application/json' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Interval Timer backup' });
        return;
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    (e.target as HTMLInputElement).value = '';
    if (!f) return;
    try {
      const imported = parseImport(await f.text());
      const ids = new Set(app.templates.map((t) => t.id));
      let added = 0;
      for (const t of imported) {
        if (ids.has(t.id)) continue;
        app.templates.push(t);
        added++;
      }
      flash(added ? `Imported ${added} template${added === 1 ? '' : 's'}` : 'All templates in that file are already here');
    } catch (err) {
      flash((err as Error).message);
    }
  }
</script>

<main class="page">
  <div class="top">
    <h1 class="disp">Workouts</h1>
    <button class="chip" onclick={() => (app.settings.voice = !app.settings.voice)} aria-label="Cue sound">
      {app.settings.voice ? '🗣 Voice' : '🔔 Beeps'}
    </button>
  </div>

  <div class="list">
    {#each app.templates as t, k (t.id)}
      {@const total = totalSec(t)}
      <div class="tcard" style:--c={colours[k % colours.length]}>
        <i class="o1"></i><i class="o2"></i>
        <button class="meta" onclick={() => openEditor(t.id)}>
          <div class="disp nm">{t.name || 'Untitled'}</div>
          <div class="sm2">{summary(t)}</div>
          <div class="disp tot">{mmss(total)}</div>
        </button>
        <button class="play" aria-label="Start {t.name}" disabled={total === 0} onclick={() => startTemplate(t.id)}>{@html icon.play}</button>
      </div>
    {/each}
    <button class="dashed" onclick={create}>+ New workout</button>
  </div>

  <div class="backup">
    <button onclick={exportAll}>Export backup</button>
    <button onclick={() => fileInput.click()}>Import backup</button>
    <input bind:this={fileInput} type="file" accept="application/json,.json" hidden onchange={importFile} />
  </div>
</main>

{#if toast}<div class="toast" role="status">{toast}</div>{/if}
