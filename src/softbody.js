// Small-step XPBD: compliant distance constraints with accumulated multipliers.
// All simulated positions are in character-local units. Pose anchors provide active control.
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export class Mesh {
  constructor(points, edges) {
    this.points = points.map((p) => ({
      x: p[0],
      y: p[1],
      px: p[0],
      py: p[1],
      inv: p[2] ?? 1,
    }));
    this.edges = edges.map(([a, b, compliance = 1e-6]) => ({
      a,
      b,
      rest: Math.hypot(
        points[a][0] - points[b][0],
        points[a][1] - points[b][1],
      ),
      compliance,
      lambda: 0,
    }));
  }
  step(h, force, anchors, collide) {
    const damp = Math.exp(-h * 3);
    for (let i = 0; i < this.points.length; i++) {
      let p = this.points[i];
      if (anchors.has(i)) {
        const a = anchors.get(i);
        p.x = p.px = a[0];
        p.y = p.py = a[1];
        continue;
      }
      const vx = (p.x - p.px) * damp,
        vy = (p.y - p.py) * damp;
      p.px = p.x;
      p.py = p.y;
      p.x += vx + force.x * h * h;
      p.y += vy + force.y * h * h;
    }
    for (const e of this.edges) e.lambda = 0;
    for (let iter = 0; iter < 8; iter++) {
      for (const e of this.edges) {
        const a = this.points[e.a],
          b = this.points[e.b],
          wa = anchors.has(e.a) ? 0 : a.inv,
          wb = anchors.has(e.b) ? 0 : b.inv,
          dx = b.x - a.x,
          dy = b.y - a.y,
          len = Math.hypot(dx, dy);
        if (len < 1e-8 || wa + wb === 0) continue;
        const alpha = e.compliance / (h * h),
          dl = (-(len - e.rest) - alpha * e.lambda) / (wa + wb + alpha);
        e.lambda += dl;
        a.x -= (wa * dl * dx) / len;
        a.y -= (wa * dl * dy) / len;
        b.x += (wb * dl * dx) / len;
        b.y += (wb * dl * dy) / len;
      }
      if (collide)
        for (let i = 0; i < this.points.length; i++)
          if (!anchors.has(i)) collide(this.points[i], i);
    }
  }
}
export class SecondaryMotion {
  constructor() {
    this.cloth = new Map();
    this.hair = new Map();
    this.bend = 0;
    this.bendV = 0;
    this.previousV = { x: 0, y: 0 };
    this.force = { x: 0, y: 400 };
    this.dt = 1 / 60;
    this.rotation = 0;
    this.strength = 1;
  }
  update(dt, vx, vy, gravity, rotation = 0, strength = 1) {
    this.dt = Math.min(dt, 1 / 30);
    const ax = clamp(
        (vx - this.previousV.x) / Math.max(dt, 0.001),
        -5000,
        5000,
      ),
      ay = clamp((vy - this.previousV.y) / Math.max(dt, 0.001), -5000, 5000);
    this.previousV = { x: vx, y: vy };
    const fx = -ax * 0.55,
      fy = gravity * 0.45 - ay * 0.55;
    this.force = {
      x: (fx * Math.cos(rotation) + fy * Math.sin(rotation)) * strength,
      y: (-fx * Math.sin(rotation) + fy * Math.cos(rotation)) * strength,
    };
    this.strength = strength;
    const h = this.dt / 4;
    for (let j = 0; j < 4; j++) {
      this.bendV +=
        (-this.bend * 110 - this.bendV * 13 - ax * 0.006 * strength) * h;
      this.bend += this.bendV * h;
      this.bend = clamp(this.bend, -14, 14);
    }
  }
  pants(side, hip, knee, foot) {
    const rows = 7,
      cols = 5;
    const target = (r, c) => {
      const u = r / (rows - 1),
        a = u < 0.5 ? hip : knee,
        b = u < 0.5 ? knee : foot,
        v = u < 0.5 ? u * 2 : (u - 0.5) * 2;
      const width = 10 + Math.sin(u * Math.PI) * 5;
      return [
        a[0] * (1 - v) + b[0] * v + (c / (cols - 1) - 0.5) * width * 2,
        a[1] * (1 - v) + b[1] * v - 5,
      ];
    };
    let mesh = this.cloth.get(side);
    if (!mesh) {
      let pts = [],
        edges = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          pts.push(target(r, c));
          const i = r * cols + c;
          if (c) edges.push([i - 1, i, 2e-6]);
          if (r) edges.push([i - cols, i, 2e-6]);
          if (r && c) {
            edges.push([i - cols - 1, i, 1e-5]);
            edges.push([i - cols, i - 1, 1e-5]);
          }
          if (r > 1) edges.push([i - cols * 2, i, 3e-4]);
          if (c > 1) edges.push([i - 2, i, 3e-4]);
        }
      mesh = new Mesh(pts, edges);
      this.cloth.set(side, mesh);
    }
    const pins = new Map();
    for (let c = 0; c < cols; c++) {
      pins.set(c, target(0, c));
      pins.set((rows - 1) * cols + c, target(rows - 1, c));
    }
    // A weak garment fitting envelope prevents tunneling through the leg in 2D.
    const collision = (p, i) => {
      const r = Math.floor(i / cols),
        c = i % cols,
        t = target(r, c);
      const limit = 8 + Math.sin((r / (rows - 1)) * Math.PI) * 7;
      p.x = clamp(p.x, t[0] - limit, t[0] + limit);
      p.y = clamp(p.y, t[1] - 10, t[1] + 10);
    };
    if (!this.frozen)
      for (let s = 0; s < 4; s++)
        mesh.step(this.dt / 4, this.force, pins, collision);
    return { mesh, rows, cols };
  }
  strand(id, root, tip) {
    let mesh = this.hair.get(id);
    if (!mesh) {
      const pts = Array.from({ length: 5 }, (_, i) => [
        root[0] + ((tip[0] - root[0]) * i) / 4,
        root[1] + ((tip[1] - root[1]) * i) / 4,
      ]);
      mesh = new Mesh(pts, [
        [0, 1, 1e-7],
        [1, 2, 1e-7],
        [2, 3, 1e-7],
        [3, 4, 1e-7],
        [0, 2, 5e-5],
        [1, 3, 5e-5],
        [2, 4, 5e-5],
      ]);
      this.hair.set(id, mesh);
    }
    const pins = new Map([
      [0, root],
      [
        1,
        [
          root[0] + (tip[0] - root[0]) * 0.25,
          root[1] + (tip[1] - root[1]) * 0.25,
        ],
      ],
    ]);
    if (!this.frozen)
      for (let s = 0; s < 4; s++) {
        mesh.step(
          this.dt / 4,
          { x: this.force.x * 0.75, y: this.force.y * 0.22 },
          pins,
        );
        for (let i = 2; i < 5; i++) {
          const p = mesh.points[i],
            tx = root[0] + ((tip[0] - root[0]) * i) / 4,
            ty = root[1] + ((tip[1] - root[1]) * i) / 4;
          p.x += (tx - p.x) * 0.018;
          p.y += (ty - p.y) * 0.018;
        }
      }
    return mesh.points;
  }
}
