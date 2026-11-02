<script lang="ts">
  import { picker } from './state.svelte';
  import Wheel from './Wheel.svelte';

  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 12 }, (_, i) => i * 5);

  let a = $state(0);
  let b = $state(0);

  $effect(() => {
    const r = picker.req;
    if (!r) return;
    if (r.kind === 'duration') {
      a = Math.floor(r.value / 60);
      b = r.value % 60 - ((r.value % 60) % 5);
    } else {
      a = r.value;
    }
  });

  const counts = $derived(
    picker.req?.kind === 'count'
      ? Array.from({ length: (picker.req.max ?? 30) - (picker.req.min ?? 1) + 1 }, (_, i) => i + (picker.req?.min ?? 1))
      : [],
  );

  function done() {
    const r = picker.req;
    if (!r) return;
    picker.req = null;
    if (r.kind === 'duration') r.onDone(Math.max(r.min ?? 0, a * 60 + b));
    else r.onDone(a);
  }
  const close = () => (picker.req = null);
</script>

{#if picker.req}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="sheet" onclick={(e) => e.target === e.currentTarget && close()}>
    <div class="card" role="dialog" aria-label={picker.req.title}>
      <div class="ph">
        <button onclick={close}>Cancel</button>
        <h3>{picker.req.title}</h3>
        <button class="pdone" onclick={done}>Done</button>
      </div>
      <div class="wheels">
        {#if picker.req.kind === 'duration'}
          <Wheel values={minutes} bind:value={a} label={(v) => `${v} min`} />
          <Wheel values={seconds} bind:value={b} label={(v) => `${String(v).padStart(2, '0')} sec`} />
        {:else}
          <Wheel values={counts} bind:value={a} label={(v) => String(v)} />
        {/if}
      </div>
    </div>
  </div>
{/if}
