<script lang="ts">
  import { app, persist } from './state.svelte';
  import { requestPersistence } from '../platform/storage';
  import ListScreen from './ListScreen.svelte';
  import EditorScreen from './EditorScreen.svelte';
  import TimerScreen from './TimerScreen.svelte';
  import Picker from './Picker.svelte';

  // Save whenever templates or settings change.
  $effect(() => {
    JSON.stringify(app.templates);
    JSON.stringify(app.settings);
    persist();
  });

  requestPersistence();

  const editing = $derived(app.templates.find((t) => t.id === app.editingId));
  const running = $derived(app.templates.find((t) => t.id === app.runningId));
</script>

{#if app.view === 'timer' && running}
  <TimerScreen template={running} />
{:else if app.view === 'edit' && editing}
  <EditorScreen template={editing} />
{:else}
  <ListScreen />
{/if}
<Picker />
