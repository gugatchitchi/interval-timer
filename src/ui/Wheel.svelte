<script lang="ts">
  let { values, value = $bindable(), label }: { values: number[]; value: number; label: (v: number) => string } = $props();
  const H = 44;
  let el: HTMLDivElement;

  $effect(() => {
    const i = Math.max(0, values.indexOf(value));
    requestAnimationFrame(() => {
      if (el && Math.round(el.scrollTop / H) !== i) el.scrollTop = i * H;
    });
  });

  function onScroll() {
    const i = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / H)));
    if (values[i] !== value) value = values[i];
  }
</script>

<div class="wheel">
  <div class="wsel"></div>
  <div class="wsc" bind:this={el} onscroll={onScroll} role="listbox" tabindex="0" aria-label="Choose value">
    {#each values as v (v)}
      <div class="wi" role="option" aria-selected={v === value}>{label(v)}</div>
    {/each}
  </div>
</div>
