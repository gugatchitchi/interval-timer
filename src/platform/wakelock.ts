// Keeps the screen on while a run is active. iOS releases the lock when the app is hidden.

let lock: WakeLockSentinel | null = null;

export async function keepAwake(): Promise<void> {
  try {
    if (lock && !lock.released) return;
    lock = (await navigator.wakeLock?.request('screen')) ?? null;
  } catch {
    lock = null;
  }
}

export function allowSleep(): void {
  void lock?.release().catch(() => {});
  lock = null;
}
