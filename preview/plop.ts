/* A small "plop", made with the Web Audio API so there is no file to load. Browsers keep sound
   silent until the visitor has done something (a click, a key, a tap), so the audio context is
   made on the first such gesture; a plop asked for before that is simply skipped. */
let ctx: AudioContext | null = null;
let armed = false;

function arm() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const unlock = () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = ctx ?? new AC();
      void ctx.resume();
    } catch {
      /* no audio */
    }
    for (const e of ["pointerdown", "keydown", "touchend"]) window.removeEventListener(e, unlock);
  };
  for (const e of ["pointerdown", "keydown", "touchend"]) window.addEventListener(e, unlock, { passive: true });
}
arm();

export function plop() {
  try {
    if (!ctx || ctx.state !== "running") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);

    // a small sparkle: three tiny high notes, each a little higher than the last, very quiet.
    // No low tone and no click, so it never reads as a beep.
    for (const [freq, delay, len] of [
      [1568, 0, 0.18],
      [2093, 0.06, 0.18],
      [2637, 0.12, 0.25],
    ] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t + delay);
      g.gain.exponentialRampToValueAtTime(0.03, t + delay + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + len);
      osc.connect(g).connect(out);
      osc.start(t + delay);
      osc.stop(t + delay + len + 0.03);
    }
  } catch {
    /* no audio */
  }
}
