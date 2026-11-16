/* Space and portal for the portal hero preview.
   One full-screen fragment shader (plain WebGL, no library) paints a black
   universe: fine stars, soft pale light drifting in from two corners and a
   bundle of thin vertical lines with light running down them. Scrolling flies
   you into it: the stars stretch into streaks and a white planet comes
   towards you. The planet itself becomes the emblem (portalEmblem.ts draws
   that in 3D on top); here its disc and halo dissolve into the calm, dark
   room the emblem hangs in. Everything
   the transition needs is a uniform, so GSAP only tweens numbers. */

export type SpaceState = {
  warp: number; // 0..1 speed of the flight: stars stretch, lines and light let go
  travel: number; // distance flown, in star layers
  planet: number; // radius of the planet, in viewport heights (0 = not there yet)
  fill: number; // 0..1 the white disc and halo of the planet
  room: number; // 0..1 space calms down into the room of the emblem
  hover: number; // 0..1
  mx: number; // -1..1 pointer parallax
  my: number;
};

export type Space = {
  /** The moment its clock started (performance.now). */
  t0: number;
  state: SpaceState;
  resize: () => void;
  start: () => void;
  stop: () => void;
  renderOnce: () => void;
  destroy: () => void;
};

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uPx, uWarp, uTravel, uPlanet, uFill, uRoom, uHover;
uniform vec2 uMouse;

float hash11(float n){ return fract(sin(n * 127.1) * 43758.5453); }
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise2(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm2(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * noise2(p); p = p * 2.02 + vec2(13.1, 7.7); a *= 0.5; } return s; }

/* One layer of still stars: a grid in CSS px with at most one round star per cell. */
float stars(vec2 px, float cell, float chance, float size, float seed){
  vec2 g = px / cell;
  vec2 id = floor(g) + seed;
  float r = hash21(id);
  if (r > chance) return 0.0;
  vec2 c = 0.2 + 0.6 * vec2(hash21(id + 1.7), hash21(id + 5.3));
  float dd = length(fract(g) - c) * cell;
  float tw = 0.6 + 0.4 * sin(uTime * (0.6 + 1.6 * hash21(id + 9.1)) + r * 600.0);
  return (smoothstep(size, size * 0.25, dd) + exp(-dd * dd / (size * size * 5.0)) * 0.3) * tw;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 q = (frag - 0.5 * uRes) / uRes.y;      // centred, viewport height = 1
  vec2 uv = (frag / uRes - 0.5) * 2.0;        // -1..1 both ways, whatever the aspect
  float px = 1.0 / uRes.y;                    // one canvas pixel in q units
  float r = length(q);
  vec2 dir = q / max(r, 0.0001);
  float y01 = frag.y / uRes.y;

  float R = uPlanet;
  float sd = r - R;
  float there = smoothstep(0.0, 0.004, R) * uFill;
  vec2 qs = q;

  vec3 col = vec3(0.0);
  vec3 light = vec3(0.80, 0.93, 0.96);
  float calm = 1.0 - uWarp; // the scenery of the opening screen lets go when you fly off


  // soft light drifting in from the bottom left and the top right
  vec2 buv = uv * (1.0 - 0.25 * uWarp) + uMouse * 0.03;
  float dg = dot(buv, vec2(0.7071));
  float n1 = fbm2(buv * 0.9 + vec2(uTime * 0.035, -uTime * 0.020));
  float n2 = fbm2(buv * 0.9 + vec2(-uTime * 0.030, uTime * 0.025) + 7.3);
  float e1 = 0.62 + 0.30 * sin(uTime * 0.21);
  float e2 = 0.58 + 0.30 * sin(uTime * 0.17 + 2.4);
  float b1 = smoothstep(e1, e1 + 0.95, dg + (n1 - 0.5) * 0.9);
  float b2 = smoothstep(e2, e2 + 0.95, -dg + (n2 - 0.5) * 0.9);
  col += vec3(0.72, 0.87, 0.90) * (pow(b1, 1.4) + pow(b2, 1.4)) * 1.15 * (1.0 - 0.7 * uWarp) * (1.0 - uRoom);

  // still stars, fine as dust
  vec2 sp = qs * uRes.y / uPx / (1.0 + 0.6 * uWarp) + uMouse * vec2(-6.0, -3.0);
  float st = stars(sp, 7.0, 0.16, 0.5, 0.0) * 0.32 + stars(sp, 19.0, 0.22, 0.8, 40.0) * 0.55 + stars(sp, 67.0, 0.30, 1.3, 90.0) * 0.9;
  col += vec3(0.92, 0.96, 1.0) * st * (1.0 - 0.85 * uWarp);

  // stars in depth: they drift towards you, and stretch into streaks in flight
  float travel = uTravel + uTime * 0.011;
  float streak = 0.28 * uWarp * smoothstep(0.0, 0.35, r);
  float ws = 0.0;
  for (int i = 0; i < 6; i++){
    float fi = float(i);
    float z = fract(fi / 6.0 + travel);
    float sc = mix(24.0, 0.7, z);
    vec2 g = qs * sc + fi * 17.31;
    vec2 id = floor(g);
    float rnd = hash21(id + fi * 7.0);
    if (rnd < 0.22){
      vec2 c = (vec2(hash21(id + 1.7), hash21(id + 5.3)) - 0.5) * 0.4;
      vec2 d = fract(g) - 0.5 - c;
      float size = (0.9 + 1.6 * z) * px * sc;
      float dr = dot(d, dir) / (1.0 + streak / size);
      float dt = dot(d, vec2(-dir.y, dir.x));
      float fade = smoothstep(0.0, 0.12, z) * smoothstep(1.0, 0.8, z);
      ws += smoothstep(size, size * 0.2, length(vec2(dr, dt))) * fade * (0.4 + 0.6 * z) * (0.5 + rnd / 0.44);
    }
  }
  col += vec3(0.86, 0.94, 1.0) * ws * mix(0.4, 1.5, uWarp);

  // thin vertical lines with light running down them
  float ln = 0.0;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    float lx = -0.075;
    if (i == 1) lx = -0.033;
    if (i == 2) lx = 0.009;
    if (i == 3) lx = 0.049;
    if (i == 4) lx = 0.090;
    float dx = abs(q.x - lx) / px;
    float core = smoothstep(uPx * 0.9, 0.0, dx);
    float head = 1.25 - fract(uTime * (0.055 + 0.05 * hash11(fi + 3.0)) + hash11(fi * 5.7 + 1.0)) * 1.6;
    float t = y01 - head;
    float tail = t > 0.0 ? exp(-t / 0.13) : smoothstep(-0.004, 0.0, t);
    ln += core * 0.075 * smoothstep(0.98, 0.80, y01);
    ln += (core + exp(-dx / (uPx * 2.5)) * 0.35) * tail * 0.95;
  }
  col += vec3(0.90, 0.97, 1.0) * ln * (1.0 - smoothstep(0.0, 0.6, uWarp)) * (1.0 + 0.6 * uHover) * (1.0 - uRoom);

  // light at the end of the flight
  col += vec3(0.75, 0.90, 0.95) * exp(-r / (0.06 + 0.2 * uWarp)) * 0.35 * (uWarp + 0.25 * uHover);

  // two tilted orbits around the middle of the screen, each with a light travelling along it
  for (int i = 0; i < 2; i++){
    float fi = float(i);
    vec2 ab = i == 0 ? vec2(0.78, 0.20) : vec2(1.10, 0.36);
    float ang = i == 0 ? -0.32 : 0.21;
    vec2 op = q - vec2(0.0, -0.02);
    op = vec2(op.x * cos(ang) + op.y * sin(ang), -op.x * sin(ang) + op.y * cos(ang));
    vec2 en = op / ab;
    float el = length(en);
    float od = abs(el - 1.0) * ab.y / max(length(en / ab) * ab.y / max(el, 0.0001), 0.2);   // roughly the distance to the ellipse
    float line = smoothstep(px * 1.6, 0.0, od);
    float a = atan(en.y, en.x);
    float head = uTime * (i == 0 ? 0.33 : -0.21) + fi * 2.1;
    float behind = mod((i == 0 ? head - a : a - head), 6.28318);
    float tail = exp(-behind / 0.55);
    float sat = exp(-behind * behind / 0.0009) * exp(-od / (px * 3.0));
    col += light * (line * (0.045 + 0.5 * tail) + sat * 1.0) * calm;
  }

  // the room of the emblem: the same black, a few stars, and a soft pool of light to hang in
  vec2 gq = q - vec2(0.0, 0.02);
  float g2 = dot(gq, gq);
  // black space, like the hero: only a breath of light right behind the emblem, so the carbon still reads
  vec3 room = light * (0.075 * exp(-g2 / 0.07) + 0.012 * exp(-g2 / 0.5));
  room += vec3(0.92, 0.96, 1.0) * st * 0.8;
  // leaving the room for another page is a flight too: the streaks show here as well
  // the stars in depth keep drifting towards you here too, so the room is never a still image
  room += vec3(0.86, 0.94, 1.0) * ws * mix(0.45, 1.5, uWarp) + light * exp(-r / 0.26) * 0.2 * uWarp;
  col = mix(col, room, uRoom);

  // the planet: a white ball of light with a halo
  col += light * exp(-max(sd, 0.0) / (0.012 + 0.16 * R)) * there * 0.8;
  // exactly the white of the emblem wrapped around it (portalEmblem.ts), so nothing of the
  // emblem shows on the planet before it starts to unroll
  col = mix(col, vec3(0.93, 0.97, 1.0), smoothstep(px * 1.5, -px * 1.5, sd) * there);

  col += (hash21(frag + fract(uTime) * 91.0) - 0.5) * 0.024;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** `t0` lets a second canvas run on the clock of the first, so both show the same sky. */
export function createSpace(canvas: HTMLCanvasElement, opts: { t0?: number } = {}): Space | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };

  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
  } catch (err) {
    console.warn("[portal hero] space shader failed", err);
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = {
    res: u("uRes"),
    time: u("uTime"),
    px: u("uPx"),
    warp: u("uWarp"),
    travel: u("uTravel"),
    planet: u("uPlanet"),
    fill: u("uFill"),
    room: u("uRoom"),
    hover: u("uHover"),
    mouse: u("uMouse"),
  };

  const state: SpaceState = { warp: 0, travel: 0, planet: 0, fill: 1, room: 0, hover: 0, mx: 0, my: 0 };
  let scale = 1; // canvas px per CSS px
  let raf = 0;
  let running = false;
  const t0 = opts.t0 ?? performance.now();

  function resize() {
    // never 0: a hidden tab reports an empty viewport, and a division by 0 would poison the shader with NaN
    const w = canvas.clientWidth || window.innerWidth || 1;
    const h = canvas.clientHeight || window.innerHeight || 1;
    // cap the pixel count: the scene is soft, sharpness comes from the UI on top
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = Math.min(dpr, Math.sqrt(1_700_000 / (w * h)));
    canvas.width = Math.max(2, Math.round(w * scale));
    canvas.height = Math.max(2, Math.round(h * scale));
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    const s = state;
    gl!.uniform2f(U.res, canvas.width, canvas.height);
    gl!.uniform1f(U.time, (performance.now() - t0) / 1000);
    gl!.uniform1f(U.px, scale);
    gl!.uniform1f(U.warp, s.warp);
    gl!.uniform1f(U.travel, s.travel);
    gl!.uniform1f(U.planet, s.planet);
    gl!.uniform1f(U.fill, s.fill);
    gl!.uniform1f(U.room, s.room);
    gl!.uniform1f(U.hover, s.hover);
    gl!.uniform2f(U.mouse, s.mx, s.my);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function loop() {
    if (!running) return;
    draw();
    raf = requestAnimationFrame(loop);
  }

  resize();
  return {
    t0,
    state,
    resize,
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    renderOnce: draw,
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      // the context is left alive: a remount (hot reload) gets the same canvas back
    },
  };
}
