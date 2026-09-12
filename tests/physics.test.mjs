import test from "node:test";
import assert from "node:assert/strict";
import { Physics } from "../src/physics.js";
import { SecondaryMotion, Mesh } from "../src/softbody.js";
import { animations, pose } from "../src/rig.js";
test("gravity settles, bounds remain finite after large throws", () => {
  let p = new Physics();
  p.vx = 10000;
  p.vy = -10000;
  for (let i = 0; i < 12000; i++) p.step(1 / 120);
  assert.ok(p.x >= 55 && p.x <= 745);
  assert.equal(p.y, 575);
  assert.equal(p.vy, 0);
});
test("pendulum loses energy with damping", () => {
  let p = new Physics();
  p.swing = true;
  const initial = Math.abs(p.angle);
  for (let i = 0; i < 5000; i++) p.step(1 / 120);
  assert.ok(Math.abs(p.angle) < initial * 0.1);
});
test("cloth and hair withstand gravity and alternating impulses", () => {
  const s = new SecondaryMotion();
  for (let i = 0; i < 900; i++) {
    s.update(1 / 60, Math.sin(i * 0.2) * 1000, Math.cos(i * 0.13) * 500, 1800);
    const { mesh } = s.pants(-1, [-6, 14], [-8, 38], [-4, 60]);
    s.strand(0, [-8, -20], [-10, -35]);
    for (const p of mesh.points)
      assert.ok(
        Number.isFinite(p.x) &&
          Number.isFinite(p.y) &&
          Math.abs(p.x) < 100 &&
          Math.abs(p.y) < 120,
      );
  }
  assert.ok(Number.isFinite(s.bend));
});
test("XPBD pins hold and stretch stays bounded", () => {
  let m = new Mesh(
    [
      [0, 0],
      [0, 10],
      [0, 20],
    ],
    [
      [0, 1, 1e-7],
      [1, 2, 1e-7],
    ],
  );
  for (let i = 0; i < 1000; i++)
    m.step(1 / 240, { x: 0, y: 900 }, new Map([[0, [0, 0]]]));
  assert.equal(m.points[0].y, 0);
  assert.ok(Math.abs(m.points[2].y - 20) < 0.1);
});
test("30 distinct animation names and finite poses", () => {
  assert.equal(new Set(animations).size, 30);
  for (const a of animations)
    for (let i = 0; i < 24; i++)
      for (const v of Object.values(pose(a, i / 24)))
        if (typeof v === "number") assert.ok(Number.isFinite(v));
});
