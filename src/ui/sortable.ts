import Sortable from 'sortablejs';

/**
 * Svelte action: drag to reorder children by their ".handle".
 * Sortable moves DOM nodes itself, so we put the node back and let Svelte re-render from state.
 */
export function sortable(node: HTMLElement, onMove: (from: number, to: number) => void) {
  let cb = onMove;
  const s = Sortable.create(node, {
    handle: '.handle',
    animation: 180,
    ghostClass: 'ghost',
    onEnd(e) {
      const { oldIndex, newIndex, item, from } = e;
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
      item.remove();
      from.insertBefore(item, from.children[oldIndex] ?? null);
      cb(oldIndex, newIndex);
    },
  });
  return {
    update(next: (from: number, to: number) => void) { cb = next; },
    destroy() { s.destroy(); },
  };
}
