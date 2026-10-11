import * as ex from "excalibur";

export class Car extends ex.Actor {
  constructor(pos: { x: number; y: number }) {
    super({
      pos: ex.vec(pos.x, pos.y),
      width: 16,
      height: 20,
      color: ex.Color.Yellow,
    });
  }

  private speed: number = 0;

  public onPreUpdate(engine: ex.Engine, elapsed: number): void {
    const dt = elapsed / 1000;

    if (engine.input.keyboard.isHeld(ex.Keys.W) && this.speed < 100) {
      this.speed = this.speed + 15 * dt;
    }

    if (this.speed != 0 && engine.input.keyboard.isHeld(ex.Keys.A)) {
      this.rotation = this.rotation - 1.5 * dt;
    }

    if (this.speed != 0 && engine.input.keyboard.isHeld(ex.Keys.D)) {
      this.rotation = this.rotation + 1.5 * dt;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.S) && this.speed > 0) {
      this.speed = this.speed - 30 * dt;
    }
    if (!engine.input.keyboard.isHeld(ex.Keys.W)) {
      this.speed = this.speed - 9 * dt;
    }

    this.vel = ex.Vector.fromAngle(this.rotation - 1.5708).scale(
      new ex.Vector(this.speed, this.speed),
    );
  }
}
