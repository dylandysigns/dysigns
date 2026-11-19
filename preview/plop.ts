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

    // a soft wooden "tok": one low, round note that drops a little in pitch and dies away fast.
    // No high tone, so it never reads as a beep.
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.15);

    // plus a very short, dull knock on the front of it, like a fingertip on wood
    const n = Math.floor(ctx.sampleRate * 0.018);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const ng = ctx.createGain();
    ng.gain.value = 0.08;
    src.connect(lp).connect(ng).connect(out);
    src.start(t);
  } catch {
    /* no audio */
  }
}
