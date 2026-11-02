/** 75 -> "1:15" */
export function mmss(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Countdown text: seconds alone under a minute, else m:ss. */
export function countdown(sec: number): string {
  return sec >= 60 ? mmss(sec) : String(Math.max(0, sec));
}
