<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte';
  import { app, goList } from './state.svelte';
  import type { Template } from '../core/model';
  import { buildPlan, intervalTitle, type Interval } from '../core/plan';
  import { back, goTo, pause, resume, secLeft, skip, startRun, tick, totalMsLeft, type Run, type Step } from '../core/engine';
  import { cueAt, spokenCue, spokenStart, SPOKEN_DONE } from '../core/cues';
  import { beep, say, stopSpeech } from '../platform/audio';
  import { allowSleep, keepAwake } from '../platform/wakelock';
  import { countdown, mmss } from './format';
  import * as icon from './icons';

  let { template }: { template: Template } = $props();

  // The plan is fixed when the run starts; editing is not possible while running.
  const plan: Interval[] = untrack(() => buildPlan($state.snapshot(template) as Template));
  const totalPlanSec = plan.reduce((s, i) => s + i.sec, 0);
  let run = $state.raw<Run>(startRun(plan, performance.now()).run);
  let now = $state(performance.now());
  let confirmStop = $state(false);
  let lastCueSec = plan[0]?.sec ?? 0;
  let raf = 0;
  let cardsEl = $state<HTMLDivElement>();

  const cur = $derived(plan[run.index]);
  const left = $derived(secLeft(run, now));
  const running = $derived(run.status === 'running');
  const done = $derived(run.status === 'done');

  function apply(step: Step) {
    run = step.run;
    for (const e of step.events.slice(-1)) {
      if (e.type === 'done') {
        app.settings.voice ? say(SPOKEN_DONE) : beep('done');
        allowSleep();
      } else {
        const iv = plan[e.index];
        lastCueSec = iv.sec;
        app.settings.voice ? say(spokenStart(iv)) : beep('start');
      }
    }
  }

  function frame() {
    const t = performance.now();
    apply(tick(run, t));
    now = t;
    if (run.status === 'running') {
      const s = secLeft(run, t);
      if (s !== lastCueSec) {
        lastCueSec = s;
        const c = cueAt(s, plan[run.index].sec);
        if (c) app.settings.voice ? say(spokenCue(c)) : beep(c.type === 'count' ? 'count' : 'tick');
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function togglePlay() {
    const t = performance.now();
    if (running) run = pause(run, t);
    else if (!done) { run = resume(run, t); void keepAwake(); }
    now = t;
  }
  const doSkip = () => apply(skip(run, performance.now()));
  const doBack = () => apply(back(run, performance.now()));

  function askStop() {
    if (done) return goList();
    if (running) togglePlay();
    confirmStop = true;
  }
  function keepGoing() {
    confirmStop = false;
    togglePlay();
  }

  // A web page can't tell a call from a lock, so any time the app is hidden, pause.
  function onVisibility() {
    if (document.hidden && run.status === 'running') {
      run = pause(run, performance.now());
      stopSpeech();
    }
  }

  onMount(() => {
    if (plan.length) app.settings.voice ? say(spokenStart(plan[0])) : beep('start');
    void keepAwake();
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', onVisibility);
  });
  onDestroy(() => {
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVisibility);
    stopSpeech();
    allowSleep();
  });

  // Keep the current card centred in the strip.
  $effect(() => {
    const i = run.index;
    const c = cardsEl?.children[i] as HTMLElement | undefined;
    if (c && cardsEl) cardsEl.scrollTo({ left: c.offsetLeft - (cardsEl.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  });

  function nextWork(from: number) {
    return plan.slice(from + 1).find((i) => i.kind === 'set');
  }
  function subtitle(i: Interval, idx: number): string {
    if (i.kind === 'set') return `Set ${i.set}/${i.sets}`;
    if (i.kind === 'getReady') return `First up: ${nextWork(idx)?.exercise ?? ''}`;
    if (i.kind === 'setRest') return `Next: ${i.exercise} set ${(i.set ?? 0) + 1}`;
    const n = nextWork(idx);
    return n ? `Next: ${n.exercise}` : '';
  }
  const tag = (i: Interval) => (i.kind === 'set' ? 'WORK' : i.kind === 'getReady' ? 'READY' : 'REST');
  const cardText = (i: Interval) => (i.kind === 'set' ? `${i.exercise} · ${i.set}/${i.sets}` : intervalTitle(i));
</script>

<div class="timer" class:paused={!running && !done} class:urgent={running && left <= 5} data-ph={done ? 'done' : cur?.kind}>
  {#if !done}
    <div class="rings" aria-hidden="true"><i class="rg r1"></i><i class="rg r2"></i><i class="rg r3"></i></div>
    <div class="ttop">
      <button class="round" aria-label="Stop workout" onclick={askStop}>✕</button>
      <div>
        <div class="ttl">{running ? intervalTitle(cur).toUpperCase() : 'PAUSED'}</div>
        <div class="ttlsub">{running ? subtitle(cur, run.index) : `${intervalTitle(cur)} · ${subtitle(cur, run.index)}`}</div>
      </div>
      <button class="round" aria-label={app.settings.voice ? 'Switch to beeps' : 'Switch to voice'} onclick={() => (app.settings.voice = !app.settings.voice)}>
        {app.settings.voice ? '🗣' : '🔔'}
      </button>
    </div>
    <div class="dnum" class:long={left >= 60} aria-live="off">{countdown(left)}</div>
    <div class="tbot">
      <div class="meta2">
        <span>{run.index + 1}/{plan.length}{cur.rounds > 1 ? ` · Round ${cur.round}/${cur.rounds}` : ''}</span>
        <span>{mmss(totalMsLeft(run, now) / 1000)} left</span>
      </div>
      <div class="cards" bind:this={cardsEl}>
        {#each plan as iv, k (k)}
          <button class="card2 k-{iv.kind}" class:on={k === run.index} class:past={k < run.index} onclick={() => apply(goTo(run, k, performance.now()))}>
            <span class="tag"><i>{k + 1}</i>{tag(iv)}</span>
            <div class="c1">{mmss(iv.sec)}</div>
            <div class="c2">{cardText(iv)}</div>
          </button>
        {/each}
      </div>
      <div class="ctrls">
        <button class="sm" aria-label="Back" onclick={doBack}>{@html icon.prev}</button>
        <button class="big" aria-label={running ? 'Pause' : 'Play'} onclick={togglePlay}>{@html running ? icon.pause : icon.play}</button>
        <button class="sm" aria-label="Skip" onclick={doSkip}>{@html icon.next}</button>
      </div>
    </div>
  {:else}
    <div class="doneBox">
      <h2>DONE</h2>
      <p>{template.name} · {mmss(totalPlanSec)}</p>
      <button onclick={goList}>Back to workouts</button>
    </div>
  {/if}
</div>

{#if confirmStop}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="sheet" onclick={(e) => e.target === e.currentTarget && keepGoing()}>
    <div class="card" role="dialog" aria-label="End workout">
      <h3>End workout?</h3>
      <p>You'll lose your place in this run.</p>
      <div class="btns">
        <button onclick={keepGoing}>Keep going</button>
        <button class="danger" onclick={goList}>End workout</button>
      </div>
    </div>
  </div>
{/if}
