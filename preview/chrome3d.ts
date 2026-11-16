/* Chrome 3D assets for the hero concept preview.
   Builds the DYSIGNS emblem (and three small icons) as real extruded 3D
   geometry with a mirror-chrome material. three.js is a project dependency
   and loads as its own chunk, only when a 3D object is actually made. */


type Pt = [number, number];

export type Chrome = {
  canvas: HTMLCanvasElement;
  icons: { cursor: string; envelope: string; sparkle: string };
  renderLogo: (time: number, mx: number, my: number, still: boolean) => void;
};

/* ─── 2D helpers ─── */

/** Point where the tangent from p touches the circle (c, r). side -1 = upper (screen), +1 = lower. */
function tangentPoint(p: Pt, c: Pt, r: number, side: 1 | -1): Pt {
  const dx = c[0] - p[0];
  const dy = c[1] - p[1];
  const d = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx) + side * Math.asin(r / d);
  const len = Math.sqrt(d * d - r * r);
  return [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
}

/** Arc from the angle of `from` to the angle of `to`, angle increasing (clockwise on screen). */
function arc(c: Pt, r: number, from: Pt, to: Pt, steps = 72): Pt[] {
  const a0 = Math.atan2(from[1] - c[1], from[0] - c[0]);
  let a1 = Math.atan2(to[1] - c[1], to[0] - c[0]);
  while (a1 <= a0) a1 += Math.PI * 2;
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
  }
  return out;
}

/** Outline of a polyline drawn with a flat-capped stroke of the given width (mitered corners). */
function strokeOutline(pts: Pt[], width: number): Pt[] {
  const h = width / 2;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const normal = (a: Pt, b: Pt): Pt => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  for (let i = 0; i < pts.length; i++) {
    const n1 = normal(pts[Math.max(0, i - 1)], pts[Math.max(1, i)]);
    const n2 = normal(pts[Math.min(pts.length - 2, i)], pts[Math.min(pts.length - 1, i + 1)]);
    let mx = n1[0] + n2[0];
    let my = n1[1] + n2[1];
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml;
    my /= ml;
    const k = Math.min(3, 1 / Math.max(0.2, mx * n1[0] + my * n1[1])) * h;
    left.push([pts[i][0] + mx * k, pts[i][1] + my * k]);
    right.push([pts[i][0] - mx * k, pts[i][1] - my * k]);
  }
  return left.concat(right.reverse());
}

/* ─── DYSIGNS emblem, rebuilt from the 120 x 101 logo file ───
   Two parts: the outer arc band and the spiral stroke (inner loop, sharp
   tip on the left, middle loop, long tail). Coordinates are logo pixels. */
export function emblemOutlines(inset: number): Pt[][] {
  // `inset` shrinks every outline by that amount, so the round bevel can
  // grow back outward to the true logo edge without folding over itself.
  const W = 9.5 - inset * 2; // stroke width
  const C: Pt = [67, 50];
  const R1 = 15; // inner loop centerline
  const R2 = 29.25; // middle loop centerline
  const T: Pt = [23, 41.5]; // sharp tip
  let S: Pt = [45, 43.5]; // inner start
  let E: Pt = [5.5, 48.5]; // end of the tail

  const toward = (p: Pt, q: Pt, d: number): Pt => {
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [p[0] + ((q[0] - p[0]) / l) * d, p[1] + ((q[1] - p[1]) / l) * d];
  };
  const a1 = tangentPoint(S, C, R1, -1);
  const b1 = tangentPoint(T, C, R1, 1);
  const a2 = tangentPoint(T, C, R2, -1);
  const b2 = tangentPoint(E, C, R2, 1);
  S = toward(S, a1, inset);
  E = toward(E, b2, inset);
  const spiral: Pt[] = [S, ...arc(C, R1, a1, b1), T, ...arc(C, R2, a2, b2), E];

  // Outer band: ring segment whose ends are cut along the logo's diagonal.
  const CO: Pt = [68, 50];
  const RO = 51.4 - inset;
  const RI = 41.6 + inset;
  const P1: Pt = [82.5, 0.7];
  const P2: Pt = [70, 8.5];
  const dir: Pt = [P2[0] - P1[0], P2[1] - P1[1]];
  const dl = Math.hypot(dir[0], dir[1]);
  let n: Pt = [-dir[1] / dl, dir[0] / dl];
  if (n[1] < 0) n = [-n[0], -n[1]]; // the band lies below the top cut
  const base: Pt = [P1[0] + n[0] * inset, P1[1] + n[1] * inset];
  const hit = (r: number, near: Pt): Pt => {
    const fx = base[0] - CO[0];
    const fy = base[1] - CO[1];
    const qa = dir[0] * dir[0] + dir[1] * dir[1];
    const qb = 2 * (fx * dir[0] + fy * dir[1]);
    const qc = fx * fx + fy * fy - r * r;
    const disc = Math.sqrt(Math.max(0, qb * qb - 4 * qa * qc));
    const pts = [(-qb - disc) / (2 * qa), (-qb + disc) / (2 * qa)].map(
      (t) => [base[0] + dir[0] * t, base[1] + dir[1] * t] as Pt,
    );
    const d = (q: Pt) => Math.hypot(q[0] - near[0], q[1] - near[1]);
    return d(pts[0]) < d(pts[1]) ? pts[0] : pts[1];
  };
  const mirror = (q: Pt): Pt => [q[0], 100 - q[1]];
  const oTop = hit(RO, P1);
  const iTop = hit(RI, P2);
  const outer = arc(CO, RO, oTop, mirror(oTop), 96);
  const inner = arc(CO, RI, iTop, mirror(iTop), 96).reverse();

  return [strokeOutline(spiral, W), outer.concat(inner)];
}

/* ─── 3D ─── */

export async function createChrome(px = 480): Promise<Chrome> {
  // three.js comes from the project's own bundle, as a separate chunk that only loads when needed
  const THREE: any = await import("three");

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  /* Studio environment: a black room with a few soft light panels. The
     chrome only ever shows reflections of this, which gives the liquid
     silver on black look. */
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x24272c);
  const panel = (w: number, h: number, pos: [number, number, number], power: number, tint = 0xffffff) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  panel(14, 6, [0, 11, 3], 7); // big top softbox
  panel(3, 14, [-11, 1, 4], 5, 0xdfe8ff); // cool strip left
  panel(2.2, 12, [11, 2, 2], 6); // strip right
  panel(8, 2.5, [0, -9, 6], 1.6, 0xfff1e0); // warm floor bounce
  panel(5, 5, [4, 4, 11], 2.2); // front key
  panel(2, 8, [-6, -2, 10], 1.2); // front fill
  panel(16, 1.2, [0, 3, -11], 3); // back rim line
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.035).texture;

  const scene = new THREE.Scene();
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, 5.4);

  const chrome = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: 1, roughness: 0.07, envMapIntensity: 1.25 });

  /** Weld duplicate vertices so normals are smooth and the metal reads as one liquid surface. */
  const smooth = (geo: any) => {
    const pos = geo.attributes.position;
    const map = new Map<string, number>();
    const verts: number[] = [];
    const index: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const key = `${Math.round(x * 2e3)},${Math.round(y * 2e3)},${Math.round(z * 2e3)}`;
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
    return g;
  };

  const toShape = (pts: Pt[]) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));

  /** Extrude with a round bevel that stays inside the outline (puffy, inflated profile). */
  const puff = (shapes: any, depth: number, bevel: number, curveSegments = 24, offset = -bevel) => {
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: offset,
      bevelSegments: 12,
      curveSegments,
    });
    geo.translate(0, 0, -depth / 2);
    return new THREE.Mesh(smooth(geo), chrome);
  };

  /* Emblem */
  const k = 1 / 50;
  const emblem = puff(
    emblemOutlines(3.3).map((o) => toShape(o.map(([x, y]) => [(x - 62) * k, -(y - 50) * k] as Pt))),
    0.14,
    0.066,
    24,
    0,
  );
  const logo = new THREE.Group();
  logo.add(emblem);
  logo.scale.setScalar(0.98);

  /* Cursor arrow */
  const cursor = new THREE.Group();
  {
    const s = toShape([
      [-0.42, 0.9],
      [-0.42, -0.62],
      [-0.06, -0.28],
      [0.2, -0.9],
      [0.5, -0.77],
      [0.24, -0.16],
      [0.74, -0.16],
    ]);
    cursor.add(puff(s, 0.2, 0.1, 24, 0));
    cursor.rotation.set(-0.25, 0.5, 0.12);
    cursor.scale.setScalar(0.92);
  }

  /* Puffy envelope */
  const envelope = new THREE.Group();
  {
    const w = 1.02;
    const h = 0.7;
    const r = 0.2;
    const body = new THREE.Shape();
    body.moveTo(-w + r, -h);
    body.lineTo(w - r, -h);
    body.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
    body.lineTo(w, h - r);
    body.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
    body.lineTo(-w + r, h);
    body.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
    body.lineTo(-w, -h + r);
    body.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
    envelope.add(puff(body, 0.16, 0.19));
    const flap = puff(toShape(strokeOutline([[-0.84, 0.5], [0, -0.1], [0.84, 0.5]], 0.15)), 0.05, 0.06);
    flap.position.z = 0.27;
    envelope.add(flap);
    envelope.rotation.set(-0.3, -0.45, -0.08);
    envelope.scale.setScalar(0.95);
  }

  /* Four-pointed sparkle */
  const sparkle = new THREE.Group();
  {
    // Polar outline with softly rounded points, so the bevel stays clean.
    const pts: Pt[] = [];
    for (let i = 0; i < 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      const r = 0.13 + 0.8 * Math.abs(Math.cos(2 * a)) ** 5.5;
      pts.push([Math.sin(a) * r, Math.cos(a) * r]);
    }
    sparkle.add(puff(toShape(pts), 0.12, 0.06, 24, 0));
    sparkle.rotation.set(-0.2, 0.55, 0.2);
  }

  const still = (obj: any) => {
    scene.add(obj);
    renderer.render(scene, camera);
    const url = canvas.toDataURL("image/png");
    scene.remove(obj);
    return url;
  };
  const icons = { cursor: still(cursor), envelope: still(envelope), sparkle: still(sparkle) };

  scene.add(logo);
  const renderLogo = (time: number, mx: number, my: number, isStill: boolean) => {
    const sway = isStill ? 0 : 1;
    logo.rotation.y = -0.38 + sway * Math.sin(time * 0.55) * 0.5 + mx * 0.3;
    logo.rotation.x = -0.12 + sway * Math.sin(time * 0.4 + 1) * 0.1 + my * 0.22;
    logo.rotation.z = sway * Math.sin(time * 0.3) * 0.03;
    renderer.render(scene, camera);
  };
  renderLogo(0, 0, 0, true);

  return { canvas, icons, renderLogo };
}
