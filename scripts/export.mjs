import { createCanvas } from "@napi-rs/canvas";
import { writeFile, mkdir } from "node:fs/promises";
import { animations, drawMilo } from "../src/rig.js";
import { SecondaryMotion } from "../src/softbody.js";
await mkdir("assets/sprites", { recursive: true });
const manifest = {
  character: "Milo",
  cell: { width: 256, height: 256 },
  columns: 8,
  rows: 3,
  frames: 24,
  fps: 24,
  animations: [],
};
const contact = createCanvas(1200, 1200),
  cc = contact.getContext("2d");
cc.fillStyle = "#f2f7f4";
cc.fillRect(0, 0, 1200, 1200);
for (let n = 0; n < animations.length; n++) {
  const name = animations[n],
    sheet = createCanvas(2048, 768),
    ctx = sheet.getContext("2d"),
    soft = new SecondaryMotion();
  for (let i = 0; i < 24; i++) {
    soft.update(1 / 24, Math.sin((i / 24) * Math.PI * 2) * 80, 0, 900);
    drawMilo(
      ctx,
      (i % 8) * 256 + 128,
      Math.floor(i / 8) * 256 + 140,
      1.1,
      name,
      i / 24,
      { secondary: soft },
    );
  }
  await writeFile(`assets/sprites/${name}.png`, sheet.toBuffer("image/png"));
  manifest.animations.push({
    name,
    file: `${name}.png`,
    loop: !["jump", "land", "somersault"].includes(name),
  });
  const x = (n % 6) * 200,
    y = Math.floor(n / 6) * 240;
  drawMilo(cc, x + 100, y + 130, 1.05, name, 0.2);
  cc.fillStyle = "#263330";
  cc.font = "14px sans-serif";
  cc.textAlign = "center";
  cc.fillText(name, x + 100, y + 220);
}
await writeFile("assets/contact-sheet.png", contact.toBuffer("image/png"));
await writeFile(
  "assets/sprites/manifest.json",
  JSON.stringify(manifest, null, 2),
);
const icon = createCanvas(64, 64),
  ic = icon.getContext("2d");
drawMilo(ic, 32, 40, 0.35, "idle", 0);
await writeFile("assets/tray.png", icon.toBuffer("image/png"));
console.log(
  "Exported 30 transparent sheets, 720 frames, contact sheet and tray icon.",
);
