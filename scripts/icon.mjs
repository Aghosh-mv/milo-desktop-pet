import { createCanvas } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import { drawMilo } from "../src/rig.js";
const c = createCanvas(1024, 1024),
  x = c.getContext("2d");
x.fillStyle = "#e1f1ea";
x.beginPath();
x.roundRect(0, 0, 1024, 1024, 190);
x.fill();
drawMilo(x, 512, 570, 5, "wave", 0.15);
await writeFile("assets/icon.png", c.toBuffer("image/png"));
