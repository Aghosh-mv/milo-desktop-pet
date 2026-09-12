export const animations = [
  "idle",
  "walk-right",
  "walk-left",
  "run",
  "sprint",
  "jump",
  "fall",
  "land",
  "bounce",
  "swing",
  "wave",
  "dance",
  "sit",
  "sleep",
  "stretch",
  "yawn",
  "look-left",
  "look-right",
  "look-up",
  "look-down",
  "side-view",
  "top-view",
  "back-view",
  "spin",
  "somersault",
  "slide",
  "skid",
  "float",
  "dangle",
  "celebrate",
];
const TAU = Math.PI * 2;
export function pose(name, t) {
  const s = Math.sin(t * TAU),
    c = Math.cos(t * TAU);
  let p = {
    body: 0,
    bob: Math.sin(t * TAU) * 1.3,
    head: 0,
    la: -0.32,
    ra: 0.32,
    le: 0.2,
    re: 0.2,
    ll: 0.08,
    rl: -0.08,
    lk: 0.1,
    rk: 0.1,
    turn: 1,
    sy: 1,
    rotation: 0,
    top: false,
    back: false,
  };
  switch (name) {
    case "walk-left":
      p.turn = -1;
    case "walk-right":
      p.ll = s * 0.48;
      p.rl = -s * 0.48;
      p.la = -s * 0.55;
      p.ra = s * 0.55;
      p.lk = Math.max(0, c) * 0.5;
      p.rk = Math.max(0, -c) * 0.5;
      p.bob = -Math.abs(s) * 3;
      break;
    case "sprint":
      p.sy = 1.06;
      p.head = 0.13;
      p.rotation = 0.12;
    case "run":
      p.body = 0.18;
      p.ll = s * 0.95;
      p.rl = -s * 0.95;
      p.la = -s * 0.95;
      p.ra = s * 0.95;
      p.le = p.re = 1;
      p.lk = Math.max(0, c) * 1.35;
      p.rk = Math.max(0, -c) * 1.35;
      p.bob = -Math.abs(s) * 8;
      break;
    case "jump":
      p.bob = -Math.sin(Math.PI * t) * 35;
      p.la = -2.3;
      p.ra = 2.3;
      p.ll = -0.45;
      p.rl = 0.65;
      p.rk = 0.7;
      break;
    case "fall":
      p.la = -1.9 + 0.15 * s;
      p.ra = 1.9 + 0.15 * c;
      p.ll = -0.3;
      p.rl = 0.4;
      p.lk = p.rk = 0.6;
      break;
    case "land":
      p.sy = 1 - 0.2 * Math.sin(Math.PI * t);
      p.ll = -0.5;
      p.rl = 0.5;
      p.lk = p.rk = 1;
      break;
    case "bounce":
      p.bob = -Math.abs(s) * 28;
      p.sy = 1 + Math.cos(t * TAU * 2) * 0.1;
      p.la = -0.5;
      p.ra = 0.5;
      break;
    case "swing":
      p.rotation = s * 0.6;
      p.la = -2.8;
      p.ra = 2.8;
      p.ll = -s * 0.5;
      p.rl = -s * 0.5;
      p.lk = p.rk = 0.5;
      break;
    case "wave":
      p.ra = 2.35 + s * 0.25;
      p.re = -0.5 + s * 0.3;
      p.head = -0.07;
      break;
    case "dance":
      p.body = s * 0.18;
      p.bob = -Math.abs(c) * 6;
      p.la = -1.4 + s * 0.6;
      p.ra = 1.4 + s * 0.6;
      p.ll = s * 0.5;
      p.rl = -s * 0.5;
      break;
    case "sit":
      p.ll = -1.3;
      p.rl = 1.3;
      p.lk = p.rk = 1.3;
      p.bob = 20;
      p.la = -0.3;
      p.ra = 0.3;
      break;
    case "sleep":
      p.rotation = -1.4;
      p.la = -0.7;
      p.ra = 0.7;
      p.ll = -0.5;
      p.rl = 0.5;
      p.lk = p.rk = 0.8;
      p.bob = 12;
      p.sy = 1 + 0.02 * s;
      break;
    case "stretch":
      p.la = -2.9;
      p.ra = 2.9;
      p.body = s * 0.13;
      p.sy = 1.06;
      break;
    case "yawn":
      p.ra = 2.5;
      p.re = 1.6;
      p.head = -0.15;
      p.la = -0.4;
      break;
    case "look-left":
      p.turn = -1;
      p.head = -0.15;
      break;
    case "look-right":
      p.head = 0.15;
      break;
    case "look-up":
      p.head = -0.2;
      p.bob = -3;
      break;
    case "look-down":
      p.head = 0.28;
      p.body = 0.15;
      break;
    case "side-view":
      p.turn = 0.85;
      p.side = true;
      p.ll = s * 0.4;
      p.rl = -s * 0.4;
      p.la = -s * 0.4;
      p.ra = s * 0.4;
      break;
    case "top-view":
      p.top = true;
      p.rotation = s * 0.12;
      break;
    case "back-view":
      p.back = true;
      p.la = s * 0.15;
      p.ra = -s * 0.15;
      break;
    case "spin":
      p.turn = Math.sign(Math.cos(t * TAU)) * Math.max(0.18, Math.abs(Math.cos(t * TAU)));
      p.back = p.turn < 0;
      p.la = -1;
      p.ra = 1;
      break;
    case "somersault":
      p.rotation = t * TAU;
      p.ll = -1;
      p.rl = 1;
      p.lk = p.rk = 1.5;
      p.la = -1.8;
      p.ra = 1.8;
      break;
    case "slide":
      p.rotation = -0.7;
      p.ll = -1.4;
      p.rl = 0.7;
      p.lk = 0.2;
      p.rk = 1.5;
      p.la = -1.5;
      p.ra = 0.3;
      break;
    case "skid":
      p.body = -0.35;
      p.ll = -0.65;
      p.rl = 0.9;
      p.ra = 1;
      p.la = -0.8;
      break;
    case "float":
      p.bob = s * 10;
      p.la = -1 + s * 0.2;
      p.ra = 1 + c * 0.2;
      p.ll = -0.3;
      p.rl = 0.3;
      break;
    case "dangle":
      p.la = -3;
      p.ra = 3;
      p.body = s * 0.1;
      p.ll = s * 0.3;
      p.rl = c * 0.3;
      break;
    case "celebrate":
      p.la = -2.4 + s * 0.3;
      p.ra = 2.4 - s * 0.3;
      p.bob = -Math.abs(s) * 15;
      p.ll = -0.3;
      p.rl = 0.3;
      break;
  }
  return p;
}
function limb(x, y, a, l) {
  return [x + Math.sin(a) * l, y + Math.cos(a) * l];
}
export function drawMilo(ctx, x, y, scale, name = "idle", t = 0, extra = {}) {
  const p = pose(name, t % 1),
    ink = "#263330",
    pants = "#a8dbca";
  ctx.save();
  ctx.translate(x, y + p.bob * scale);
  ctx.scale(scale, scale);
  ctx.rotate((extra.rotation ?? p.rotation) + (extra.tilt || 0));
  ctx.scale(p.turn, p.sy);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2.3;
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  const path = (points, fill) => {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    points.slice(1).forEach((q) => ctx.lineTo(...q));
    if (fill) {
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
    ctx.stroke();
  };
  const smooth = (points, fill) => {
    ctx.beginPath();
    const first = points[0],
      last = points.at(-1);
    ctx.moveTo((first[0] + last[0]) / 2, (first[1] + last[1]) / 2);
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  };
  const ellipse = (x, y, rx, ry, fill) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  };
  if (p.top) {
    ellipse(-13, 12, 12, 21, pants);
    ellipse(13, 12, 12, 21, pants);
    path([
      [-21, 4],
      [-36, 15],
      [-39, 5],
    ]);
    path([
      [21, 4],
      [36, 15],
      [39, 5],
    ]);
    ellipse(0, -8, 23, 20, "#f9fcfa");
    path(
      [
        [-21, -17],
        [-25, -30],
        [-12, -26],
        [-9, -39],
        [1, -28],
        [13, -36],
        [14, -24],
        [24, -25],
        [21, -13],
      ],
      ink,
    );
    ctx.restore();
    return;
  }
  const hip = [0, 14],
    neck = [p.body * 45 + (extra.secondary?.bend || 0), -36];
  // Trousers follow the thigh and knee bones; cuffs remain attached to shins.
  for (const side of [-1, 1]) {
    const a = side < 0 ? p.ll : p.rl,
      k = side < 0 ? p.lk : p.rk;
    const h = [hip[0] + side * 6, hip[1]],
      knee = limb(...h, a, 24),
      foot = limb(...knee, a + k, 23);
    if (extra.secondary) {
      const { mesh, rows, cols } = extra.secondary.pants(side, h, knee, foot),
        xy = (i) => [mesh.points[i].x, mesh.points[i].y];
      const outline = [];
      for (let r = 0; r < rows; r++) outline.push(xy(r * cols));
      for (let r = rows - 1; r >= 0; r--) outline.push(xy(r * cols + cols - 1));
      smooth(outline, pants);
      ctx.save();
      ctx.strokeStyle = "#81b4a4";
      ctx.lineWidth = 0.65;
      for (const c of [1, 3]) {
        ctx.beginPath();
        ctx.moveTo(...xy(c));
        for (let r = 1; r < rows; r++) ctx.lineTo(...xy(r * cols + c));
        ctx.stroke();
      }
      ctx.restore();
    } else {
      smooth(
        [
          [h[0] - 10, h[1] - 4],
          [h[0] + 10, h[1] - 4],
          [knee[0] + 12, knee[1]],
          [foot[0] + 8, foot[1] - 6],
          [foot[0] - 9, foot[1] - 6],
          [knee[0] - 12, knee[1]],
        ],
        pants,
      );
    }
    path([
      [foot[0] - 7, foot[1] - 5],
      [foot[0] + 7, foot[1] - 5],
    ]);
    path([
      [foot[0], foot[1] - 4],
      [foot[0], foot[1] + 4],
      [foot[0] + side * 11, foot[1] + 5],
    ]);
  }
  path([
    [-13, 10],
    [13, 10],
  ]);
  ctx.beginPath();
  ctx.moveTo(0, 11);
  ctx.bezierCurveTo(
    -(extra.secondary?.bend || 0) * 0.3,
    -5,
    neck[0] * 0.6,
    -23,
    ...neck,
  );
  ctx.stroke();
  for (const side of [-1, 1]) {
    const a = side < 0 ? p.la : p.ra,
      b = side < 0 ? p.le : p.re;
    const start = [neck[0], -26],
      elbow = limb(...start, a, 23),
      hand = limb(...elbow, a + b * side, 20);
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.quadraticCurveTo(...elbow, ...hand);
    ctx.stroke();
    ellipse(...hand, 2.2, 2.2, ink);
  }
  ctx.save();
  ctx.translate(neck[0], -54);
  ctx.rotate(p.head + (extra.hair || 0) * 0.06);
  ellipse(0, 0, 20, 22, "#f9fcfa");
  const sway = Math.sin(t * TAU * 2) * 2 + (extra.hair || 0) * 3;
  if (extra.secondary) {
    path(
      [
        [-19, -7],
        [-20, -18],
        [-8, -23],
        [8, -23],
        [20, -15],
        [19, -6],
      ],
      ink,
    );
    for (const [i, root, tip] of [
      [0, [-16, -14], [-25, -28]],
      [1, [-7, -20], [-10, -36]],
      [2, [3, -21], [13, -34]],
      [3, [13, -16], [25, -26]],
    ]) {
      const ps = extra.secondary.strand(i, root, tip);
      const shape = [
        [root[0] - 5, root[1] + 3],
        ...ps.map((q) => [q.x, q.y]),
        [root[0] + 5, root[1] + 4],
      ];
      smooth(shape, ink);
    }
  } else {
    smooth(
      [
        [-19, -7],
        [-24 + sway, -24],
        [-12, -20],
        [-10 + sway, -35],
        [0, -23],
        [12 + sway, -32],
        [12, -20],
        [23 + sway, -23],
        [19, -6],
      ],
      ink,
    );
  }
  if (p.side) {
    // Profile silhouette, one visible lens, ear, and a projecting nose.
    path([[17, -4], [27, 3], [18, 6]], '#f9fcfa');
    ctx.fillStyle = ink; ctx.beginPath(); ctx.roundRect(5, -4, 16, 11, 3); ctx.fill();
    path([[-9, -2], [6, 0]]); ellipse(-10, 3, 3, 4, '#f9fcfa');
    ctx.beginPath(); ctx.moveTo(13, 13); ctx.quadraticCurveTo(18, 15, 21, 10); ctx.stroke();
  } else if (!p.back) {
    ctx.lineWidth = 1.8;
    path([
      [-20, -1],
      [-13, 0],
      [15, 0],
      [20, -2],
    ]);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.roundRect(-16, -3, 14, 10, 3);
    ctx.roundRect(2, -3, 14, 10, 3);
    ctx.fill();
    ctx.strokeStyle = "#d5eee5";
    ctx.lineWidth = 1.2;
    path([
      [-12, -1],
      [-8, 2],
    ]);
    path([
      [6, -1],
      [10, 2],
    ]);
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.arc(3, 9, 6, 0.2, 1.8);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}
