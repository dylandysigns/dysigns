/* Landscape and portal for the portal hero preview.
   One full-screen fragment shader (plain WebGL, no library) paints a deep
   blue night full of stars over a meadow of glowing orange and yellow
   flowers. The portal is a phone standing in the flowers, its screen lighting
   them; on the screen is the same meadow by day. Everything the transition needs (dolly, glow,
   frost, white-out) is a uniform, so GSAP only tweens numbers. */

export type LandscapeState = {
  /** Phone body in CSS px, top-left origin. */
  cx: number;
  cy: number;
  hw: number;
  hh: number;
  radius: number;
  /** Distance from the outer edge of the phone to its screen, CSS px. */
  frame: number;
  glow: number; // 0..1 edge and halo strength
  frost: number; // 0..1 milky screen
  dolly: number; // 0..1 camera push towards the phone
  white: number; // 0..1 white-out
  hover: number; // 0..1
  mx: number; // -1..1 pointer parallax
  my: number;
  /** Moves the whole landscape up (fraction of the height) so the ground meets the phone's base. */
  shift: number;
};

export type Landscape = {
  state: LandscapeState;
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
uniform float uTime, uPx, uRadius, uFrame, uGlow, uFrost, uDolly, uWhite, uHover, uShift, uBack;
uniform vec4 uPortal;
uniform vec2 uMouse;

float hash11(float n){ return fract(sin(n * 127.1) * 43758.5453); }
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise1(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(hash11(i), hash11(i + 1.0), f); }
float fbm1(float x){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * noise1(x); x = x * 2.03 + 17.0; a *= 0.5; } return s; }
float rbox(vec2 p, vec2 b, float r){ r = max(min(r, min(b.x, b.y)), 0.0); vec2 d = abs(p) - b + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }

float noise2(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm2(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * noise2(p); p = p * 2.02 + vec2(13.1, 7.7); a *= 0.5; } return s; }

/* One layer of stars: a grid with at most one round star per cell. */
vec3 stars(vec2 px, float cell, float chance, float size, float seed){
  vec2 g = px / cell;
  vec2 id = floor(g) + seed;
  float r = hash21(id);
  if (r > chance) return vec3(0.0);
  vec2 c = 0.2 + 0.6 * vec2(hash21(id + 1.7), hash21(id + 5.3));
  float dd = length(fract(g) - c) * cell;
  float tw = 0.65 + 0.35 * sin(uTime * (1.0 + 2.0 * hash21(id + 9.1)) + r * 600.0);
  float core = smoothstep(size, size * 0.25, dd);
  float halo = exp(-dd * dd / (size * size * 5.0)) * 0.35;
  vec3 tint = mix(vec3(1.0, 0.98, 0.95), vec3(0.45, 0.72, 1.0), step(0.6, hash21(id + 3.9)));
  return tint * (core + halo) * tw;
}

/* Sky: a deep blue night full of stars (m = 0) or a soft morning (m = 1). */
vec3 sky(vec2 q, float m){
  float sy = clamp((q.y - 0.40) / 0.60, 0.0, 1.0);
  vec3 night = mix(vec3(0.050, 0.290, 0.560), vec3(0.020, 0.170, 0.420), smoothstep(0.0, 0.45, sy));
  night = mix(night, vec3(0.012, 0.085, 0.270), smoothstep(0.35, 1.0, sy));
  night *= 0.86 + 0.30 * fbm2(q * vec2(2.2, 3.0) + vec2(uTime * 0.004, 0.0));        // painted, uneven blue
  vec3 day = mix(vec3(1.00, 0.90, 0.78), vec3(0.50, 0.72, 0.98), smoothstep(0.0, 0.7, sy));
  vec3 col = mix(night, day, m);
  vec2 px = gl_FragCoord.xy / uPx + uMouse * vec2(-6.0, -3.0);
  vec3 st = stars(px, 9.0, 0.34, 0.75, 0.0) * 0.55 + stars(px, 23.0, 0.42, 1.25, 40.0) * 0.9 + stars(px, 71.0, 0.5, 2.3, 90.0) * 1.25;
  col += st * (1.0 - m);
  return col;
}

/* Meadow: layers of dark foliage full of glowing flowers. Layers i0..i1 are composited over col. */
vec3 meadow(vec3 col, vec2 q, float m, vec2 pc, float groundY, int i0, int i1, float keep){
  for (int i = 0; i < 4; i++){
    if (i < i0 || i > i1) continue;
    float d = float(i) / 3.0;
    float z = 1.0 + uDolly * (0.22 + 1.25 * d * d);
    vec2 qq = pc + (q - pc) / z;
    qq.x += uMouse.x * 0.012 * (0.2 + d);
    qq.y += uMouse.y * 0.006 * (0.2 + d);
    float base = 0.432, amp = 0.012, cell = 0.0095;
    if (i == 1){ base = 0.398; amp = 0.022; cell = 0.0170; }
    if (i == 2){ base = 0.305; amp = 0.036; cell = 0.0310; }
    if (i == 3){ base = 0.175; amp = 0.052; cell = 0.0560; }
    float sway = sin(uTime * 0.7 + qq.x * 9.0 + float(i) * 2.0) * cell * 0.10;
    // a rolling line with small leafy bumps on top
    float h = base + amp * (fbm1(qq.x * mix(2.2, 3.4, d) + float(i) * 23.7 + 4.0) - 0.5) * 2.0;
    h += cell * 0.9 * (noise1((qq.x + sway) / cell * 1.3 + float(i) * 7.0) - 0.5);
    float below = h - qq.y;
    float cover = smoothstep(-0.0012, 0.0012, below);
    if (cover <= 0.0) continue;

    // foliage: dark blue-green at night, fresh green by day, with painted mottling
    vec3 leafN = mix(vec3(0.020, 0.105, 0.150), vec3(0.030, 0.075, 0.050), d);
    vec3 leafD = mix(vec3(0.420, 0.600, 0.360), vec3(0.200, 0.420, 0.170), d);
    vec3 lc = mix(leafN, leafD, m);
    lc *= 0.60 + 0.80 * fbm2(vec2(qq.x, below) / cell * 0.55 + float(i) * 11.0);
    float strokes = noise2(vec2((qq.x + sway) / cell * 3.0, below / cell * 0.8));
    lc += mix(vec3(0.050, 0.120, 0.060), vec3(0.160, 0.200, 0.060), m) * smoothstep(0.55, 0.9, strokes);

    // the screen throws warm light over the meadow around it
    float pool = exp(-length((qq - vec2(pc.x, groundY)) * vec2(1.0, 2.4)) * 4.2) * (1.0 - m);
    float lightAmt = pool * (0.9 + 0.8 * uGlow + 0.2 * uHover);
    lc += vec3(0.90, 0.62, 0.16) * lightAmt * 0.30;

    // flowers: two sizes per layer, thick near the top where the light catches them
    for (int j = 0; j < 2; j++){
      float cs = cell * (j == 0 ? 1.0 : 0.56);
      vec2 g = vec2(qq.x + sway * (1.0 + float(j)), below) / cs;
      vec2 id = floor(g) + float(i) * 31.0 + float(j) * 57.0;
      float r = hash21(id);
      float dens = mix(0.92, 0.42, smoothstep(0.0, cell * 7.0, below));
      if (r < dens){
        vec2 c = 0.27 + 0.46 * vec2(hash21(id + 1.3), hash21(id + 7.9));
        float rad = mix(0.15, 0.27, hash21(id + 3.3));
        float dd = length(fract(g) - c);
        float pick = hash21(id + 5.1);
        vec3 fc = pick < 0.45 ? vec3(1.00, 0.56, 0.08) : pick < 0.80 ? vec3(1.00, 0.80, 0.16) : vec3(0.96, 0.30, 0.09);
        fc *= mix(0.80 + 0.8 * lightAmt, 1.0, m) * (0.75 + 0.5 * hash21(id + 8.8));
        lc = mix(lc, fc, smoothstep(rad, rad * 0.45, dd));
        lc += fc * exp(-dd * dd / (rad * rad) * 1.4) * 0.38;
      }
    }

    // the front rows fall into shadow towards the bottom edge
    lc *= mix(1.0, 0.55, smoothstep(0.02, 0.30, below) * d * (1.0 - m));
    col = mix(col, lc, cover * keep);
  }
  return col;
}

vec3 scene(vec2 q, float m, vec2 pc, float groundY){
  return meadow(sky(q, m), q, m, pc, groundY, 0, 3, 1.0);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 q = vec2((frag.x - 0.5 * uRes.x) / uRes.y, frag.y / uRes.y);
  vec2 pc = vec2((uPortal.x - 0.5 * uRes.x) / uRes.y, uPortal.y / uRes.y);
  q.y -= uShift; pc.y -= uShift;
  float groundY = 0.38;

  // the phone: body, metal band, black bezel, screen
  vec2 p = frag - uPortal.xy;
  vec2 hs = uPortal.zw;
  float w = hs.x;
  float turn = 1.0 + 0.03 * clamp(p.x / w, -1.0, 1.0);        // slightly turned in space
  vec2 pp = vec2(p.x, p.y / turn);
  float sdB = rbox(pp, hs, uRadius);
  float band = uFrame * 0.36;
  float sdS = rbox(pp, hs - uFrame, uRadius - uFrame);
  // side buttons
  float btn = min(rbox(pp - vec2(w + band * 0.25, hs.y * 0.22), vec2(band * 0.5, hs.y * 0.13), band * 0.4),
              min(rbox(pp - vec2(-w - band * 0.25, hs.y * 0.34), vec2(band * 0.5, hs.y * 0.07), band * 0.4),
                  rbox(pp - vec2(-w - band * 0.25, hs.y * 0.14), vec2(band * 0.5, hs.y * 0.07), band * 0.4)));

  float body = smoothstep(uPx, -uPx, min(sdB, btn));
  float screen = smoothstep(uPx, -uPx, sdS);
  vec3 col = vec3(0.0);
  // uBack = 0: a video sits behind the canvas, so only the phone and its light are painted.
  // The output is premultiplied, so light with alpha 0 simply adds onto the video.
  float a = mix(body, 1.0, uBack);

  if (body < 1.0 && uBack > 0.5) col = meadow(sky(q, 0.0), q, 0.0, pc, groundY, 0, 0, 1.0);

  if (body > 0.0){
    // titanium band with soft studio streaks, then the black bezel
    float streak = 0.5 + 0.5 * sin(pp.y / hs.y * 5.0 + pp.x / w * 1.3 + 0.6);
    vec3 metal = mix(vec3(0.16, 0.16, 0.19), vec3(0.78, 0.76, 0.86), pow(streak, 2.2));
    metal += vec3(1.0) * (0.25 + 0.6 * uGlow) * smoothstep(-band, 0.0, sdB) * 0.5;
    vec3 ph = mix(vec3(0.012), metal, smoothstep(-band - uPx, -band + uPx, min(sdB, btn)));
    col = mix(col, ph, body);
  }

  if (screen > 0.0){
    // another place: shifted, enlarged, bent at the rim of the glass
    float rim = smoothstep(-0.30 * w, 0.0, sdS);
    vec2 q2 = pc + (q - pc) / 1.15 + vec2(0.0, 0.03);
    q2 += normalize(p + 0.0001) * rim * rim * 0.02;
    vec3 inner = scene(q2, 1.0, pc + vec2(0.0, 0.03), groundY) * 1.04;
    float gl = smoothstep(0.55, 1.0, sin((pp.x + pp.y * 0.55) / w * 1.5 + 0.9));
    inner += vec3(1.0) * gl * 0.07;                                              // reflection on the glass
    inner += vec3(1.0) * exp(sdS / (0.06 * w)) * (0.14 + 0.4 * uGlow);

    // what is on the screen: the camera island and the home bar
    float ui = 1.0 - uFrost;
    float island = rbox(pp - vec2(0.0, hs.y - uFrame - w * 0.17), vec2(w * 0.29, w * 0.085), w * 0.085);
    inner = mix(inner, vec3(0.006), smoothstep(uPx, -uPx, island) * ui);
    float bar = rbox(pp - vec2(0.0, -hs.y + uFrame + w * 0.07), vec2(w * 0.36, w * 0.014), w * 0.014);
    inner = mix(inner, vec3(0.05, 0.05, 0.08), smoothstep(uPx, -uPx, bar) * 0.85 * ui);

    float gy = clamp(p.y / hs.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 frost = mix(vec3(0.905, 0.905, 0.925), vec3(0.972, 0.972, 0.980), gy);
    inner = mix(inner, frost, uFrost);
    col = mix(col, inner, screen);
  }

  // the nearer rows of the meadow stand in front of the phone, so it sits in the flowers
  if (uBack > 0.5) col = meadow(col, q, 0.0, pc, groundY, 1, 3, 1.0 - body * smoothstep(0.7, 1.0, uFrost));

  // light spilling off the phone (softer over the video, which has its own light)
  float outside = max(min(sdB, btn), 0.0);
  float halo = exp(-outside / ((16.0 + 34.0 * uGlow) * uPx)) * (1.0 - body);
  col += vec3(1.0, 0.90, 0.62) * halo * (0.30 + 0.55 * uGlow + 0.16 * uHover) * mix(0.55, 1.0, uBack);
  float edge = (1.0 - smoothstep(0.0, (1.2 + 2.5 * uGlow) * uPx, abs(sdB))) * (0.55 + 0.45 * uGlow);
  col = mix(col, vec3(1.0), edge);
  a = mix(a, 1.0, edge);

  col += (hash21(frag + fract(uTime) * 91.0) - 0.5) * 0.024 * a;
  col = mix(col, vec3(0.949, 0.949, 0.957), uWhite);
  a = mix(a, 1.0, uWhite);
  gl_FragColor = vec4(col, a);
}
`;

/** With `transparent`, the meadow is left out and a video behind the canvas shows through. */
export function createLandscape(canvas: HTMLCanvasElement, opts: { transparent?: boolean } = {}): Landscape | null {
  const back = opts.transparent ? 0 : 1;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: !!opts.transparent, premultipliedAlpha: true, powerPreference: "high-performance" });
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
    console.warn("[portal hero] landscape shader failed", err);
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
    portal: u("uPortal"),
    radius: u("uRadius"),
    frame: u("uFrame"),
    glow: u("uGlow"),
    frost: u("uFrost"),
    dolly: u("uDolly"),
    white: u("uWhite"),
    hover: u("uHover"),
    mouse: u("uMouse"),
    shift: u("uShift"),
    back: u("uBack"),
  };

  const state: LandscapeState = { cx: 0, cy: 0, hw: 1, hh: 1, radius: 20, frame: 4, glow: 0, frost: 0, dolly: 0, white: 0, hover: 0, mx: 0, my: 0, shift: 0 };
  let scale = 1; // canvas px per CSS px
  let cssH = 1;
  let raf = 0;
  let running = false;
  const t0 = performance.now();

  function resize() {
    const w = canvas.clientWidth || window.innerWidth || 1;
    const h = canvas.clientHeight || window.innerHeight || 1;
    cssH = h;
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
    gl!.uniform4f(U.portal, s.cx * scale, (cssH - s.cy) * scale, s.hw * scale, s.hh * scale);
    gl!.uniform1f(U.radius, s.radius * scale);
    gl!.uniform1f(U.frame, s.frame * scale);
    gl!.uniform1f(U.glow, s.glow);
    gl!.uniform1f(U.frost, s.frost);
    gl!.uniform1f(U.dolly, s.dolly);
    gl!.uniform1f(U.white, s.white);
    gl!.uniform1f(U.hover, s.hover);
    gl!.uniform2f(U.mouse, s.mx, s.my);
    gl!.uniform1f(U.shift, s.shift);
    gl!.uniform1f(U.back, back);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function loop() {
    if (!running) return;
    draw();
    raf = requestAnimationFrame(loop);
  }

  resize();
  return {
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
