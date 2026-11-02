<script lang="ts">
  import { app, goList, openEditor, openPicker, startTemplate } from './state.svelte';
  import { duplicate, newRest, withExerciseAdded, type ExerciseBlock, type Template } from '../core/model';
  import { totalSec } from '../core/plan';
  import { sortable } from './sortable';
  import { mmss } from './format';
  import ExerciseSheet from './ExerciseSheet.svelte';
  import * as icon from './icons';

  let { template: t }: { template: Template } = $props();
  let editingEx = $state<ExerciseBlock | null>(null);
  let confirmDelete = $state(false);
  const total = $derived(totalSec(t));

  function move(from: number, to: number) {
    const [it] = t.items.splice(from, 1);
    t.items.splice(to, 0, it);
  }

  function addExercise() {
    const { template, exercise } = withExerciseAdded(t);
    t.items = template.items;
    editingEx = t.items.find((i) => i.id === exercise.id) as ExerciseBlock;
  }

  function dup() {
    const c = duplicate($state.snapshot(t) as Template);
    app.templates.splice(app.templates.indexOf(t) + 1, 0, c);
    openEditor(c.id);
  }

  function remove() {
    app.templates = app.templates.filter((x) => x.id !== t.id);
    goList();
  }

  function sets(ex: ExerciseBlock) {
    const segs: { w: number; rest: boolean }[] = [];
    for (let k = 0; k < ex.sets; k++) {
      segs.push({ w: ex.setSec, rest: false });
      if (k < ex.sets - 1 && ex.setRestSec) segs.push({ w: ex.setRestSec, rest: true });
    }
    return segs;
  }
</script>

<main class="page">
  <div class="top">
    <button class="chip" onclick={goList}>‹ Back</button>
    <div class="chips">
      <button class="chip" onclick={dup}>Duplicate</button>
      <button class="chip" onclick={() => (confirmDelete = true)}>Delete</button>
    </div>
  </div>

  <div class="ehead">
    <input class="nmIn" bind:value={t.name} aria-label="Workout name" maxlength="60" />
    <div class="chips">
      <button class="chip" onclick={() => openPicker({ kind: 'count', title: 'Rounds', value: t.rounds, onDone: (v) => (t.rounds = v) })}>
        {t.rounds} round{t.rounds > 1 ? 's' : ''}
      </button>
      {#if t.rounds > 1}
        <button class="chip" onclick={() => openPicker({ kind: 'duration', title: 'Rest between rounds', value: t.roundRestSec, onDone: (v) => (t.roundRestSec = v) })}>
          {mmss(t.roundRestSec)} between rounds
        </button>
      {/if}
    </div>
  </div>

  <div class="tl" use:sortable={move}>
    {#each t.items as it (it.id)}
      {#if it.type === 'exercise'}
        <div class="blk ex">
          <button class="open" onclick={() => (editingEx = it)}>
            <div class="row1 disp">{it.name || 'Exercise'}</div>
            <div class="row2">{it.sets} × {mmss(it.setSec)} <em>· rest {mmss(it.setRestSec)}</em></div>
            <div class="mini">
              {#each sets(it) as s, k (k)}<i class={s.rest ? 'r' : 'w'} style:flex-grow={s.w}></i>{/each}
            </div>
          </button>
          <span class="handle" aria-label="Drag to reorder">≡</span>
        </div>
      {:else}
        <div class="blk rs" class:zero={it.sec === 0}>
          <span class="disp">Rest</span>
          <button class="val" onclick={() => openPicker({ kind: 'duration', title: 'Rest', value: it.sec, onDone: (v) => (it.sec = v) })}>
            {it.sec ? mmss(it.sec) : 'skip'}
          </button>
          <button class="x" aria-label="Remove rest" onclick={() => (t.items = t.items.filter((x) => x.id !== it.id))}>✕</button>
          <span class="handle" aria-label="Drag to reorder">≡</span>
        </div>
      {/if}
    {/each}
  </div>
  {#if t.items.length === 0}<p class="empty">Add an exercise to get started.</p>{/if}

  <div class="adds">
    <button onclick={addExercise}>+ Exercise</button>
    <button onclick={() => t.items.push(newRest())}>+ Rest</button>
  </div>
</main>

<div class="startbar">
  <button disabled={total === 0} onclick={() => startTemplate(t.id)}>{@html icon.play}<span>Start · {mmss(total)}</span></button>
</div>

{#if editingEx}
  <ExerciseSheet
    exercise={editingEx}
    onclose={() => (editingEx = null)}
    onremove={() => {
      const id = editingEx?.id;
      t.items = t.items.filter((x) => x.id !== id);
      editingEx = null;
    }}
  />
{/if}

{#if confirmDelete}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="sheet" onclick={(e) => e.target === e.currentTarget && (confirmDelete = false)}>
    <div class="card" role="dialog" aria-label="Delete workout">
      <h3>Delete “{t.name}”?</h3>
      <p>This can't be undone.</p>
      <div class="btns">
        <button onclick={() => (confirmDelete = false)}>Cancel</button>
        <button class="danger" onclick={remove}>Delete</button>
      </div>
    </div>
  </div>
{/if}
