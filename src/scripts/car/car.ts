import * as ex from "excalibur";
import { carCorners, State } from "./Icar";

export class Car extends ex.Actor {
  constructor(pos: { x: number; y: number },onDone:(state: State)=>void) {
    super({
      pos: ex.vec(pos.x, pos.y),
      width: 16,
      height: 20,
      color: ex.Color.Yellow,
    });
    this.startPos = ex.vec(pos.x, pos.y);
    this.onDone =onDone;
  }

  private onDone: (state: State)=>void;
  private state: State = "running";
  private timeAlive: number = 0;
  private speed: number = 0;
  private startPos: ex.Vector;

  public getCurrentBoxPoints = () => {
    const vectors: carCorners = {
      lt: new ex.Vector(-this.width / 2, -this.height / 2)
        .rotate(this.rotation)
        .add(this.pos),
      lb: new ex.Vector(-this.width / 2, this.height / 2)
        .rotate(this.rotation)
        .add(this.pos),
      rb: new ex.Vector(this.width / 2, this.height / 2)
        .rotate(this.rotation)
        .add(this.pos),
      rt: new ex.Vector(this.width / 2, -this.height / 2)
        .rotate(this.rotation)
        .add(this.pos),
    };

    return vectors;
  };

  public onPreUpdate(engine: ex.Engine, elapsed: number): void {
    const dt = elapsed / 1000;

    if (this.state == "running") {
      this.timeAlive += elapsed;
    }
    if (this.timeAlive >= 150000) {
      this.timeout();
    }

    if (
      engine.input.keyboard.isHeld(ex.Keys.W) &&
      this.speed < 100 &&
      this.getState() == "running"
    ) {
      this.speed = this.speed + 15 * dt;
    }

    if (
      (this.speed > 4 || this.speed < -4) &&
      engine.input.keyboard.isHeld(ex.Keys.A) &&
      this.getState() == "running"
    ) {
      this.rotation = this.rotation - 1.5 * dt;
    }

    if (
      (this.speed > 4 || this.speed < -4) &&
      engine.input.keyboard.isHeld(ex.Keys.D) &&
      this.getState() == "running"
    ) {
      this.rotation = this.rotation + 1.5 * dt;
    }

    if (
      engine.input.keyboard.isHeld(ex.Keys.S) &&
      this.speed > -60 &&
      this.getState() == "running"
    ) {
      this.speed = this.speed - 30 * dt;
    }

    if (
      !engine.input.keyboard.isHeld(ex.Keys.W) &&
      this.speed > 0 &&
      this.getState() == "running"
    ) {
      this.speed = this.speed - 9 * dt;
    }

    if (
      !engine.input.keyboard.isHeld(ex.Keys.S) &&
      this.speed < 0 &&
      this.getState() == "running"
    ) {
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
    this.speed = 0;
  }
  public timeout(): void {
    this.state = "timeout";
    this.speed = 0;
  }

  public finish(): void {
    this.state = "finished";
    this.speed = 0;
  }

  public reset(): void {
    this.speed = 0;
    this.timeAlive = 0;
    this.state = "running";
    this.pos = this.startPos;
  }
}
