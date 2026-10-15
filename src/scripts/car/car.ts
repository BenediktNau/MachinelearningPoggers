import * as ex from "excalibur";
import { carCorners, State } from "./Icar";

export class Car extends ex.Actor {
  constructor(pos: { x: number; y: number }) {
    super({
      pos: ex.vec(pos.x, pos.y),
      width: 16,
      height: 20,
      color: ex.Color.Yellow,
    });
  }

  private state: State = "running";
  private timeAlive: number = 0;

  private speed: number = 0;

  public getCurrentBoxPoints = () => {
    const floorVec = (v: ex.Vector) => ex.vec(Math.floor(v.x), Math.floor(v.y));

    const vectors: carCorners = {
      lt: floorVec(
        new ex.Vector(-this.width / 2, -this.height / 2)
          .rotate(this.rotation)
          .add(this.pos),
      ),
      lb: floorVec(
        new ex.Vector(-this.width / 2, this.height / 2)
          .rotate(this.rotation)
          .add(this.pos),
      ),
      rb: floorVec(
        new ex.Vector(this.width / 2, this.height / 2)
          .rotate(this.rotation)
          .add(this.pos),
      ),
      rt: floorVec(
        new ex.Vector(this.width / 2, -this.height / 2)
          .rotate(this.rotation)
          .add(this.pos),
      ),
    };

    return vectors;
  };

  public onPreUpdate(engine: ex.Engine, elapsed: number): void {
    const dt = elapsed / 1000;

    if (this.state == "running") {
      this.timeAlive += elapsed;
    }

    if (engine.input.keyboard.isHeld(ex.Keys.W) && this.speed < 100) {
      this.speed = this.speed + 15 * dt;
    }

    if (
      (this.speed > 4 || this.speed < -4) &&
      engine.input.keyboard.isHeld(ex.Keys.A)
    ) {
      this.rotation = this.rotation - 1.5 * dt;
    }

    if (
      (this.speed > 4 || this.speed < -4) &&
      engine.input.keyboard.isHeld(ex.Keys.D)
    ) {
      this.rotation = this.rotation + 1.5 * dt;
    }

    if (engine.input.keyboard.isHeld(ex.Keys.S) && this.speed > -60) {
      this.speed = this.speed - 30 * dt;
    }

    if (!engine.input.keyboard.isHeld(ex.Keys.W) && this.speed > 0) {
      this.speed = this.speed - 9 * dt;
    }

    if (!engine.input.keyboard.isHeld(ex.Keys.S) && this.speed < 0) {
      this.speed = this.speed + 9 * dt;
    }
    this.vel = ex.Vector.fromAngle(this.rotation - 1.5708).scale(
      new ex.Vector(this.speed, this.speed),
    );
  }

  public getState(): State {
    return this.state;
  }

  public crash(): void {
    this.state = "crashed";
  }

  public finish(): void {
    this.state = "finished";
  }
}
