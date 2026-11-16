/* The DYSIGNS emblem for the portal hero preview.
   The same liquid chrome emblem as the hero concept (outline from
   chrome3d.ts), now as the object you meet behind the portal. Where the
   pointer moves the chrome turns into another material: glossy, ribbed
   black ("carbon"), with a soft pale glow around it. The
   trail is painted on an offscreen canvas and fades out again.
   three.js is a project dependency and loads as its own chunk, on demand. */

import { emblemOutlines } from "./chrome3d";


// logo pixels: the emblem is drawn on a 120 x 101 field
const W = 120;
const H = 101;
const CX = 60;
const CY = 50.5;
const DEPTH = 7;
const BEVEL = 3.3;
const HALO_PAD = 1.6; // the halo plane is this much larger than the logo field
const TRAIL_LIFE = 1.5; // seconds
const MASK_W = 384;
const MASK_H = Math.round((MASK_W * H) / W);
const REST_TURN = -24; // degrees around the vertical axis
const X_TILT = -9;

export const EMBLEM_SPIN_START = REST_TURN + 654; // edge-on, back side first
export const EMBLEM_SPIN_REST = REST_TURN;

/** Radius of the sphere the emblem is wrapped around while it is still a planet, in logo pixels. */
export const PLANET_R = 44;
/** The planet's radius as a share of the emblem's width. */
export const PLANET_SHARE = PLANET_R / W;
/** Width of the emblem on screen, in CSS px. */
export function emblemWidthPx(cw: number, ch: number) {
  return cw < 720 ? Math.min(cw * 0.6, ch * 0.34) : Math.min(cw * 0.3, ch * 0.5);
}

export type EmblemState = {
  still: boolean; // reduced motion: it does not float
  morph: number; // 0 = wrapped around a white sphere (the planet), 1 = the chrome emblem
  spin: number; // degrees around the vertical axis
  auto: number; // 0..1 a patch of black travelling over the emblem, outside that range it is off
  scale: number;
};

export type Emblem = {
  state: EmblemState;
  setPointer: (clientX: number, clientY: number, paint: boolean) => void;
  clearPointer: () => void;
  resize: () => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

const SIZE = `vec2(${W.toFixed(1)}, ${H.toFixed(1)})`;

/* Shared by the chrome and the halo: the slightly frayed edge of the touched area. */
const GLOW = `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise2(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float lit(sampler2D mask, vec2 uv){
  float m = texture2D(mask, uv).r;
  return smoothstep(0.16, 0.62, m + (noise2(uv * 22.0) - 0.5) * 0.12);
}
`;

const HALO_VERT = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const HALO_FRAG = `
uniform sampler2D uMask, uHalo;
uniform float uTime;
varying vec2 vUv;
${GLOW}
void main(){
  // vUv spans the padded plane; the mask only covers the logo field in its middle
  vec2 muv = (vUv - 0.5) * ${HALO_PAD.toFixed(2)} + 0.5;
  float m = texture2D(uMask, clamp(muv, 0.0, 1.0)).r;
  float inField = step(0.0, muv.x) * step(muv.x, 1.0) * step(0.0, muv.y) * step(muv.y, 1.0);
  float shape = texture2D(uHalo, vUv).r;                 // heavily blurred silhouette
  float a = smoothstep(0.04, 0.75, shape) * smoothstep(0.05, 0.6, m) * inField;
  a *= 0.86 + 0.14 * sin(uTime * 2.4 + muv.x * 9.0);
  gl_FragColor = vec4(vec3(0.72, 0.88, 0.92), a * 0.3);
}`;

/* ─── Emblem silhouette as a texture, a little blurred so the shader can read the distance to the edge ─── */

function paintShape(outlines: [number, number][][], blurUnits: number, pad: number) {
  const cw = 1024;
  const ch = Math.round((cw * H) / W);
  const k = cw / (W * pad);
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cw, ch);
  if ("filter" in ctx) ctx.filter = `blur(${(blurUnits * k).toFixed(1)}px)`;
  ctx.fillStyle = "#fff";
  const px = (x: number) => (x - CX) * k + cw / 2;
  const py = (y: number) => (y - CY) * k + ch / 2;
  for (const o of outlines) {
    ctx.beginPath();
    o.forEach(([x, y], i) => (i ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y))));
    ctx.closePath();
    ctx.fill();
  }
  return c;
}

/* ─── Trail mask ─── */

function createMask() {
  const canvas = document.createElement("canvas");
  canvas.width = MASK_W;
  canvas.height = MASK_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, MASK_W, MASK_H);

  const rad = MASK_W * 0.24;
  const brush = document.createElement("canvas");
  brush.width = brush.height = Math.ceil(rad * 2);
  const bc = brush.getContext("2d")!;
  const g = bc.createRadialGradient(rad, rad, 0, rad, rad, rad);
  g.addColorStop(0, "rgba(255,255,255,0.85)");
  g.addColorStop(0.45, "rgba(255,255,255,0.42)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  bc.fillStyle = g;
  bc.fillRect(0, 0, brush.width, brush.height);

  type Dab = { x: number; y: number; t: number };
  let dabs: Dab[] = [];
  let dirty = false;

  return {
    canvas,
    add(u: number, v: number, now: number) {
      const x = u * MASK_W;
      const y = (1 - v) * MASK_H;
      const last = dabs[dabs.length - 1];
      if (last && Math.hypot(last.x - x, last.y - y) < 5 && now - last.t < 0.07) return;
      dabs.push({ x, y, t: now });
    },
    /** Repaints from the live dabs, so the fade is exact and leaves no residue. */
    paint(now: number) {
      dabs = dabs.filter((d) => now - d.t < TRAIL_LIFE);
      if (!dabs.length && !dirty) return false;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, MASK_W, MASK_H);
      ctx.globalCompositeOperation = "lighter";
      for (const d of dabs) {
        const age = (now - d.t) / TRAIL_LIFE;
        const grow = Math.min(1, age * 7); // quick fade in
        ctx.globalAlpha = grow * Math.pow(1 - age, 1.4);
        ctx.drawImage(brush, d.x - rad, d.y - rad);
      }
      dirty = dabs.length > 0;
      return true;
    },
  };
}

export async function createEmblem(canvas: HTMLCanvasElement): Promise<Emblem> {
  // three.js comes from the project's own bundle, as a separate chunk that only loads when needed
  const THREE: any = await import("three");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  /* Studio the chrome reflects: a pale room with soft light panels and two
     dark flags, so the metal keeps contrast against the light page. */
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x8d9098);
  const panel = (w: number, h: number, pos: [number, number, number], power: number, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(power), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  panel(14, 6, [0, 11, 3], 7); // big top softbox
  panel(3, 14, [-11, 1, 4], 5, 0xe8e0ff); // lavender strip left
  panel(2.2, 12, [11, 2, 2], 6, 0xe0f0ff); // cool strip right
  panel(8, 2.5, [0, -9, 6], 2.2, 0xffe0f0); // pink floor bounce
  panel(5, 5, [4, 4, 11], 2.4); // front key
  panel(4, 10, [-7, -1, 9], 0.02); // dark flag front left
  panel(3, 9, [8, -3, 8], 0.02); // dark flag front right
  panel(16, 1.2, [0, 3, -11], 3); // back rim line
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.035).texture;

  const scene = new THREE.Scene();
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(26, 1, 10, 4000);

  const root = new THREE.Group(); // float and pointer tilt
  const pose = new THREE.Group();
  const spin = new THREE.Group(); // rotation around the vertical axis
  pose.rotation.x = (X_TILT * Math.PI) / 180;
  root.add(pose);
  pose.add(spin);
  scene.add(root);

  const mask = createMask();
  const maskTex = new THREE.CanvasTexture(mask.canvas);
  maskTex.generateMipmaps = false;
  maskTex.minFilter = THREE.LinearFilter;
  const uMask = { value: maskTex };
  const uTime = { value: 0 };
  const uMorph = { value: 1 };

  /* Chrome body: extruded with a round bevel that grows back out to the true logo edge */
  const toLocal = ([x, y]: [number, number]) => new THREE.Vector2(x - CX, -(y - CY));
  const shapes = emblemOutlines(BEVEL).map((o) => new THREE.Shape(o.map(toLocal)));
  let geo = new THREE.ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelOffset: 0, bevelSegments: 12, curveSegments: 24 });
  geo.translate(0, 0, -DEPTH / 2);
  {
    // weld duplicate vertices so the metal reads as one liquid surface
    const pos = geo.attributes.position;
    const map = new Map<string, number>();
    const verts: number[] = [];
    const index: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const key = `${Math.round(x * 40)},${Math.round(y * 40)},${Math.round(z * 40)}`;
      let id = map.get(key);
      if (id === undefined) {
        id = verts.length / 3;
        verts.push(x, y, z);
        map.set(key, id);
      }
      index.push(id);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    geo.dispose();
    geo = g;
  }
  const chrome = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: 1, roughness: 0.07, envMapIntensity: 1.2 });
  chrome.onBeforeCompile = (shader: any) => {
    // where the trail is, the chrome becomes glossy ribbed black
    shader.uniforms.uMask = uMask;
    shader.uniforms.uTime = uTime;
    shader.uniforms.uMorph = uMorph;
    // The planet: every vertex has a place on the half of a sphere that faces you. The emblem
    // lies over it like a thin skin, its lines pulled in towards the rim, in front of the ball
    // of light the space canvas draws. uMorph lets that skin relax into the flat emblem, the
    // middle first and the outer arcs last. Seen from the front nothing folds or crosses:
    // the lines only spread out and settle.
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vObjPos;
         uniform float uMorph;
         vec3 onPlanet(vec3 p){
           float len = length(p.xy);
           float rr = clamp(len / 66.0, 0.0, 1.0);
           float th = rr * 1.5708;
           vec2 d = len > 0.001 ? p.xy / len : vec2(1.0, 0.0);
           // the emblem keeps a little of its own thickness, but inwards: its outer face is exactly
           // the surface of the planet, so no part of it can stick out past the ball of light
           return (${PLANET_R.toFixed(1)} + (p.z - ${(DEPTH / 2 + BEVEL).toFixed(2)}) * 0.5) * vec3(d * sin(th), cos(th));
         }
         float morphAt(vec3 p){
           float rr = clamp(length(p.xy) / 66.0, 0.0, 1.0);
           float m = clamp(uMorph * 1.25 - 0.25 * rr, 0.0, 1.0);
           return m * m * m * (m * (m * 6.0 - 15.0) + 10.0);   // smootherstep: no visible start or stop
         }`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
         vec3 planetN = normalize(onPlanet(position)) * (objectNormal.z < -0.3 ? -1.0 : 1.0);
         objectNormal = normalize(mix(planetN, objectNormal, morphAt(position)));`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vObjPos = position;
         transformed = mix(onPlanet(position), position, morphAt(position));`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform sampler2D uMask;\nuniform float uTime;\nuniform float uMorph;\nvarying vec3 vObjPos;\n${GLOW}`)
      .replace(
        "#include <dithering_fragment>",
        `// as a planet it is pure white light; the chrome comes through while it unrolls
         gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.93, 0.97, 1.0), 1.0 - smoothstep(0.12, 0.95, uMorph));
         vec2 guv = vObjPos.xy / ${SIZE} + 0.5;
         // no carbon while it is still (partly) a planet
         float inkOn = smoothstep(0.9, 1.0, uMorph);
         float glowAmt = lit(uMask, guv) * inkOn;
         float soft = texture2D(uMask, guv).r * inkOn;
         // fine ribs running diagonally over the surface, like brushed glass
         float ribs = 0.5 + 0.5 * sin((vObjPos.x + vObjPos.y * 0.6 + vObjPos.z * 0.8) * 3.6);
         float facing = pow(max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 0.6);
         // glossy black: ribs catch a thin line of light, a faint trace of the room stays in it
         vec3 ink = vec3(0.012, 0.012, 0.018) + vec3(0.40, 0.44, 0.48) * pow(ribs, 6.0) * facing;
         ink += gl_FragColor.rgb * 0.10;
         gl_FragColor.rgb = mix(gl_FragColor.rgb, ink, glowAmt);
         gl_FragColor.rgb *= 1.0 - smoothstep(0.03, 0.4, soft) * (1.0 - glowAmt) * 0.55;   // darkness creeping ahead
         #include <dithering_fragment>`,
      );
  };
  const body = new THREE.Mesh(geo, chrome);
  spin.add(body);

  // invisible plane the pointer is measured against, so the trail also runs through the gaps of the emblem
  const hitPlane = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.3, H * 1.3), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  hitPlane.visible = false;
  spin.add(hitPlane);

  // pale glow around the touched parts, so the black reads against the dark room, on a plane through the middle of the emblem
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(W * HALO_PAD, H * HALO_PAD),
    new THREE.ShaderMaterial({
      vertexShader: HALO_VERT,
      fragmentShader: HALO_FRAG,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      uniforms: { uMask, uTime, uHalo: { value: new THREE.CanvasTexture(paintShape(emblemOutlines(0), 7, HALO_PAD)) } },
    }),
  );
  halo.renderOrder = 2;
  spin.add(halo);

  const state: EmblemState = { still: false, morph: 1, spin: EMBLEM_SPIN_START, auto: -1, scale: 1 };
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const local = new THREE.Vector3();
  let pointer: { x: number; y: number; paint: boolean } | null = null;
  let tiltX = 0;
  let tiltY = 0;
  let pxToWorld = 0.1;
  let raf = 0;
  let running = false;
  const t0 = performance.now();

  function resize() {
    const cw = canvas.clientWidth || window.innerWidth || 1;
    const ch = canvas.clientHeight || window.innerHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    // the emblem's width in px
    pxToWorld = W / emblemWidthPx(cw, ch);
    const visibleH = ch * pxToWorld;
    camera.position.set(0, 0, visibleH / 2 / Math.tan((camera.fov * Math.PI) / 360));
    camera.updateProjectionMatrix();
  }

  function frame() {
    if (!running) return;
    const now = (performance.now() - t0) / 1000;
    uTime.value = now;
    uMorph.value = state.morph;

    // float and pointer tilt
    const rect = canvas.getBoundingClientRect();
    let tx = 0;
    let ty = 0;
    if (pointer) {
      tx = ((pointer.x - rect.left) / rect.width - 0.5) * 2;
      ty = ((pointer.y - rect.top) / rect.height - 0.5) * 2;
    }
    const max = (6 * Math.PI) / 180;
    tiltX += (ty * max - tiltX) * 0.08;
    tiltY += (tx * max - tiltY) * 0.08;
    root.rotation.set(tiltX, tiltY, 0);
    // it only starts to float once it is the emblem: the planet stays put on its halo
    root.position.y = state.still ? 0 : Math.sin((now / 5) * Math.PI * 2) * 8 * pxToWorld * state.morph;
    root.scale.setScalar(state.scale);
    spin.rotation.y = (state.spin * Math.PI) / 180;
    root.updateMatrixWorld(true);

    // light under the pointer
    if (pointer?.paint) {
      ndc.set(((pointer.x - rect.left) / rect.width) * 2 - 1, -(((pointer.y - rect.top) / rect.height) * 2 - 1));
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(hitPlane, false)[0];
      if (hit) {
        local.copy(hit.point);
        hitPlane.worldToLocal(local);
        mask.add(local.x / W + 0.5, local.y / H + 0.5, now);
      }
    }
    // a patch of light that travels on its own while the emblem spins in
    if (state.auto >= 0 && state.auto <= 1) {
      const a = state.auto * Math.PI * 2;
      mask.add(0.55 + 0.34 * Math.cos(a + 2.4), 0.5 + 0.36 * Math.sin(a + 2.4), now);
    }
    if (mask.paint(now)) maskTex.needsUpdate = true;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  resize();
  return {
    state,
    setPointer(x, y, paint) {
      pointer = { x, y, paint };
    },
    clearPointer() {
      pointer = null;
    },
    resize,
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
