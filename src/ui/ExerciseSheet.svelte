<script lang="ts">
  import type { ExerciseBlock } from '../core/model';
  import { openPicker } from './state.svelte';
  import { mmss } from './format';

  let { exercise: ex, onclose, onremove }: { exercise: ExerciseBlock; onclose: () => void; onremove: () => void } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="sheet" onclick={(e) => e.target === e.currentTarget && onclose()}>
  <div class="card" role="dialog" aria-label="Edit exercise">
    <div class="ph">
      <button class="danger-t" onclick={onremove}>Remove</button>
      <h3>Exercise</h3>
      <button class="pdone" onclick={onclose}>Done</button>
    </div>
    <input class="field" bind:value={ex.name} aria-label="Exercise name" maxlength="40" />
    <div class="vals">
      <button onclick={() => openPicker({ kind: 'count', title: 'Sets', value: ex.sets, onDone: (v) => (ex.sets = v) })}>
        <small>SETS</small><b>{ex.sets}</b>
      </button>
      <button onclick={() => openPicker({ kind: 'duration', title: 'Set length', value: ex.setSec, min: 5, onDone: (v) => (ex.setSec = v) })}>
        <small>SET</small><b>{mmss(ex.setSec)}</b>
      </button>
      <button onclick={() => openPicker({ kind: 'duration', title: 'Rest between sets', value: ex.setRestSec, onDone: (v) => (ex.setRestSec = v) })}>
        <small>SET REST</small><b>{mmss(ex.setRestSec)}</b>
      </button>
    </div>
  </div>
</div>
