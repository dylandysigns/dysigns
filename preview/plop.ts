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

    // a soft glass tap: two quiet, low tones a fifth apart that die away fast, no pitch sweep
    for (const [freq, peak, len] of [
      [392, 0.07, 0.16],
      [588, 0.035, 0.11],
    ] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + len + 0.02);
    }

    // and a very short, dull click on the front of it, so it reads as a touch, not a beep
    const n = Math.floor(ctx.sampleRate * 0.02);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    const ng = ctx.createGain();
    ng.gain.value = 0.05;
    src.connect(lp).connect(ng).connect(out);
    src.start(t);
  } catch {
    /* no audio */
  }
}
