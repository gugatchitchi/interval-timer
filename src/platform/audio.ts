// Beeps (Web Audio) and voice (built-in speech). Both must be unlocked by a user tap on iOS.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!ctx) {
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call from a tap handler (e.g. Start) so later cues are allowed to play. */
export function unlockAudio(): void {
  const a = audio();
  if (a) {
    const b = a.createBuffer(1, 1, 22050);
    const s = a.createBufferSource();
    s.buffer = b;
    s.connect(a.destination);
    s.start(0);
  }
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}

export function beep(kind: 'tick' | 'count' | 'start' | 'done'): void {
  const a = audio();
  if (!a) return;
  const [freq, len] = { tick: [880, 0.15], count: [1040, 0.1], start: [660, 0.45], done: [520, 0.7] }[kind];
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  const t = a.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + len + 0.02);
}

let voice: SpeechSynthesisVoice | null | undefined;
function pickVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined && voice !== null) return voice;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  voice = voices.find((v) => /premium|enhanced/i.test(v.name)) ?? voices.find((v) => v.localService) ?? voices[0] ?? null;
  return voice;
}

/** Speaks text, cutting off anything still being said so cues stay on time. */
export function say(text: string): void {
  if (!('speechSynthesis' in window)) return beep('tick');
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.05;
    speechSynthesis.speak(u);
  } catch {
    beep('tick');
  }
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
