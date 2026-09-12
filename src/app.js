import { SecondaryMotion } from "./softbody.js";
import { animations, drawMilo } from "./rig.js";
import { Physics } from "./physics.js";
const secondary = new SecondaryMotion();
const overlay = new URLSearchParams(location.search).has("overlay");
document.body.classList.toggle("overlay", overlay);
const canvas = document.querySelector("canvas"),
  ctx = canvas.getContext("2d"),
  world = new Physics();
let mode = "idle",
  time = 0,
  last = performance.now(),
  paused = false,
  autonomy = true,
  quiet = matchMedia("(prefers-reduced-motion: reduce)").matches,
  next = 7,
  lock = 0,
  hair = 0;
document.querySelector("#quiet").checked = quiet;
world.renderFactor = overlay ? 0.82 : 1.55;
function resize() {
  let r = canvas.getBoundingClientRect(),
    d = devicePixelRatio;
  canvas.width = r.width * d;
  canvas.height = r.height * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  world.resize(r.width, r.height);
}
new ResizeObserver(resize).observe(canvas);
const select = document.querySelector("#animation");
animations.forEach((a) => select.add(new Option(a.replaceAll("-", " "), a)));
select.onchange = () => action(select.value, 15);
function action(a, duration = 4) {
  if (!overlay) window.milo?.action(a);
  mode = a;
  select.value = a;
  lock = time + duration;
  world.swing = a === "swing";
  if (a === "jump" || a === "bounce" || a === "celebrate") world.jump();
  if (a === "sleep") {
    world.vx = 0;
    lock = time + 3600;
  }
  if (a === "swing") {
    world.angle = 0.8;
    world.angular = 0;
  }
  document.querySelector("#state").textContent =
    a === "sleep" ? "Recharging his tiny batteries" : a.replaceAll("-", " ");
}
document
  .querySelectorAll("[data-action]")
  .forEach((b) => (b.onclick = () => action(b.dataset.action)));
for (const key of ["gravity", "bounce", "size"])
  document.querySelector("#" + key).oninput = (e) => {
    world[key] = +e.target.value;
    window.milo?.setting(key, +e.target.value);
  };
document.querySelector("#autonomy").onchange = (e) => {
  autonomy = e.target.checked;
  window.milo?.setting("autonomy", autonomy);
};
document.querySelector("#quiet").onchange = (e) => {
  quiet = e.target.checked;
  window.milo?.setting("quiet", quiet);
};
document.querySelector("#pause").onclick = (e) => {
  paused = !paused;
  e.target.textContent = paused ? "Resume Milo" : "Pause Milo";
  window.milo?.setting("paused", paused);
};
document.querySelector("#desktop").onclick = () => {
  if (window.milo) {
    window.milo.roam();
    document.querySelector("#environment").textContent =
      "Milo is roaming. Use the menu-bar icon to bring him back or quit.";
  } else
    document.querySelector("#environment").textContent =
      "Download and open the desktop app to let Milo roam above your windows.";
};
function point(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
canvas.onpointerdown = (e) => {
  const p = point(e);
  if (
    overlay &&
    (Math.abs(p.x - world.x) > 65 * world.size ||
      Math.abs(p.y - world.y) > 100 * world.size)
  )
    return;
  canvas.setPointerCapture(e.pointerId);
  world.drag = p;
  world.swing = false;
  mode = "dangle";
  lock = time + 2;
};
canvas.onpointermove = (e) => {
  if (world.drag) world.drag = point(e);
};
canvas.onpointerup = canvas.onpointercancel = () => {
  world.drag = null;
  mode = "fall";
  lock = time + 1;
};
canvas.ondblclick = () => action("jump");
canvas.oncontextmenu = (e) => {
  e.preventDefault();
  window.milo?.menu();
};
canvas.onkeydown = (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    action("jump");
  }
  if (e.key === "ArrowLeft") world.vx -= 160;
  if (e.key === "ArrowRight") world.vx += 160;
  if (e.key === "Escape") window.milo?.studio();
};
window.milo?.onAction((a) => {
  if (a === "pause") paused = !paused;
  else action(a);
});
window.milo?.onSetting((k, v) => {
  if (k === "autonomy") autonomy = v;
  else if (k === "quiet") quiet = v;
  else if (k === "paused") paused = v;
  else if (["size", "gravity", "bounce"].includes(k)) world[k] = v;
});
let sent = 0,
  accumulator = 0;
function frame(now) {
  let dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  if (!paused) {
    time += dt;
    accumulator += dt;
    while (accumulator >= 1 / 120) {
      world.step(1 / 120);
      accumulator -= 1 / 120;
    }
    hair += (world.vx / 200 - hair) * Math.min(1, dt * 8);
    if (
      autonomy &&
      !quiet &&
      !world.drag &&
      !world.swing &&
      time > next &&
      time > lock
    ) {
      next = time + 5 + Math.random() * 9;
      const a = ["idle", "walk-right", "wave", "sit", "stretch", "jump"][
        Math.floor(Math.random() * 6)
      ];
      action(a, 3);
      if (a === "walk-right") world.vx = (Math.random() < 0.5 ? -1 : 1) * 100;
    }
    if (time > lock && !world.drag && !world.swing) {
      mode =
        Math.abs(world.vx) > 30
          ? world.vx < 0
            ? "walk-left"
            : "walk-right"
          : "idle";
      if (world.vy < -100) mode = "jump";
      else if (world.vy > 100) mode = "fall";
    }
  }
  secondary.frozen = paused || quiet;
  if (!paused)
    secondary.update(
      dt,
      world.vx,
      world.vy,
      world.gravity,
      world.swing ? world.angle : 0,
      quiet ? 0 : 1,
    );
  ctx.clearRect(0, 0, world.w, world.h);
  if (!overlay) {
    ctx.strokeStyle = "#dce5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, world.h - 12);
    ctx.lineTo(world.w - 25, world.h - 12);
    ctx.stroke();
  }
  if (world.swing) {
    ctx.strokeStyle = "#71867c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(world.w / 2, 85);
    ctx.lineTo(world.x, world.y - 72 * world.size);
    ctx.stroke();
  }
  drawMilo(
    ctx,
    world.x,
    world.y,
    world.size * (overlay ? 0.82 : 1.55),
    mode,
    quiet ? 0 : time * (mode === "run" ? 1.8 : 0.8),
    {
      rotation: world.swing ? world.angle : undefined,
      tilt: world.drag
        ? Math.max(-0.5, Math.min(0.5, world.vx / 1000))
        : world.impact * 0.12,
      hair: quiet ? 0 : hair,
      secondary,
    },
  );
  if (overlay && now - sent > 60) {
    sent = now;
    window.milo?.bounds({
      x: world.x - 65 * world.size,
      y: world.y - 110 * world.size,
      w: 130 * world.size,
      h: 180 * world.size,
      drag: !!world.drag,
    });
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
