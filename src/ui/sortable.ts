import Sortable from 'sortablejs';

/**
 * Svelte action: drag to reorder children by their ".handle".
 * Sortable moves DOM nodes itself, but Svelte owns this DOM (including hidden marker
 * nodes between items). So after a drop we put the dragged node back exactly where it
 * was, then update state and let Svelte do the real move.
 */
export function sortable(node: HTMLElement, onMove: (from: number, to: number) => void) {
  let cb = onMove;
  let originalNext: Node | null = null;
  const s = Sortable.create(node, {
    handle: '.handle',
    animation: 180,
    ghostClass: 'ghost',
    onStart(e) {
      originalNext = e.item.nextSibling;
    },
    onEnd(e) {
      const { oldIndex, newIndex, item, from } = e;
      from.insertBefore(item, originalNext);
      originalNext = null;
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
      cb(oldIndex, newIndex);
    },
  });
  return {
    update(next: (from: number, to: number) => void) { cb = next; },
    destroy() { s.destroy(); },
  };
}
