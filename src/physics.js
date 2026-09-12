export class Physics {
  constructor(w = 800, h = 650) {
    this.w = w;
    this.h = h;
    this.x = w * 0.6;
    this.y = h - 145;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 900;
    this.bounce = 0.65;
    this.size = 1;
    this.renderFactor = 1;
    this.drag = null;
    this.swing = false;
    this.angle = 0.7;
    this.angular = 0;
    this.impact = 0;
    this.grounded = false;
  }
  resize(w, h) {
    this.w = w;
    this.h = h;
    this.x = Math.min(this.x, w - 50);
    this.y = Math.min(this.y, h - 80);
  }
  step(dt) {
    dt = Math.min(Math.max(dt, 0), 1 / 30);
    const floor = this.h - 75 * this.size * this.renderFactor;
    this.impact *= Math.exp(-dt * 12);
    if (this.drag) {
      const ax = (this.drag.x - this.x) * 110 - this.vx * 16,
        ay = (this.drag.y - this.y) * 110 - this.vy * 16;
      this.vx += ax * dt;
      this.vy += ay * dt;
    } else if (this.swing) {
      this.angular +=
        ((-this.gravity / 170) * Math.sin(this.angle) - 0.25 * this.angular) *
        dt;
      this.angle += this.angular * dt;
      this.x = this.w / 2 + Math.sin(this.angle) * 170;
      this.y = 105 + Math.cos(this.angle) * 170;
      this.vx = Math.cos(this.angle) * this.angular * 170;
      this.vy = -Math.sin(this.angle) * this.angular * 170;
      return;
    } else this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.grounded = false;
    if (this.y > floor) {
      this.y = floor;
      this.impact = Math.min(1, Math.abs(this.vy) / 700);
      this.vy = Math.abs(this.vy) > 85 ? -Math.abs(this.vy) * this.bounce : 0;
      this.vx *= Math.exp(-dt * 5);
      this.grounded = true;
    }
    if (this.y < 95 * this.size * this.renderFactor) {
      this.y = 95 * this.size * this.renderFactor;
      this.vy = Math.abs(this.vy) * 0.5;
    }
    const margin = 55 * this.size * this.renderFactor;
    if (this.x < margin) {
      this.x = margin;
      this.vx = Math.abs(this.vx) * this.bounce;
    }
    if (this.x > this.w - margin) {
      this.x = this.w - margin;
      this.vx = -Math.abs(this.vx) * this.bounce;
    }
    this.vx *= Math.exp(-dt * 0.15);
  }
  jump() {
    this.swing = false;
    this.vy = -580;
    this.vx += (Math.random() - 0.5) * 200;
  }
}
