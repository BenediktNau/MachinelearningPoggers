import * as ex from "excalibur";
import { carCorners, State } from "./Icar";
import { DrivingNetwork } from "../../AI/Input";
import { params } from "../../AI/params";

const MAX_SPEED = 100;
const MAX_DISTANCE = 707; // Diagonale der 500x500 Karte
const COLOR_NORMAL = ex.Color.fromHex("#38bdf8");
const COLOR_BEST = ex.Color.fromHex("#facc15");

export class Car extends ex.Actor {
  constructor(
    pos: { x: number; y: number },
    finishPos: { x: number; y: number },
    brain: DrivingNetwork,
    onDone: (state: State) => void,
  ) {
    super({
      pos: ex.vec(pos.x, pos.y),
      width: 16,
      height: 20,
      color: COLOR_NORMAL,
    });
    this.startPos = ex.vec(pos.x, pos.y);
    this.finishPos = ex.vec(finishPos.x, finishPos.y);
    this.brain = brain;
    this.onDone = onDone;
    this.reset();
  }

  public brain: DrivingNetwork;
  private onDone: (state: State) => void;
  private state: State = "running";
  private timeAlive: number = 0;
  private speed: number = 0;
  private startPos: ex.Vector;
  private finishPos: ex.Vector;
  private gas: number = 0; // -1 .. +1, kommt vom Netz
  private steer: number = 0; // -1 .. +1, kommt vom Netz
  private closest: number = 0; // kleinster Abstand zum Ziel in diesem Lauf

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

    if (this.state != "running") {
      this.vel = ex.Vector.Zero;
      return;
    }

    this.timeAlive += elapsed;
    if (this.timeAlive >= params.timeout * 1000) {
      this.timeout();
      this.vel = ex.Vector.Zero;
      return;
    }

    
    if (this.timeAlive > 2000 && Math.abs(this.speed) < 4) {
      this.timeout();
      return;
    }

    //Gas und speed regelung
    if (this.gas > 0 && this.speed < MAX_SPEED) {
      this.speed += this.gas * 15 * dt;
    }
    if (this.gas < 0 && this.speed > -10) {
      this.speed += this.gas * 30 * dt;
    }
    if (this.speed > 4 || this.speed < -4) {
      this.rotation += this.steer * 1.5 * dt;
    }

    this.vel = ex.Vector.fromAngle(this.rotation - 1.5708).scale(
      new ex.Vector(this.speed, this.speed),
    );
  }

  //Sensoren werden jeden Frame an das Netz weiter gegeben
  public think(rays: number[]): void {
    const toFinish = this.finishPos.sub(this.pos);
    const distance = toFinish.magnitude;
    this.closest = Math.min(this.closest, distance);

    // Winkel zum Ziel relativ zur Fahrtrichtung: 0 = direkt vorne, - = links, + = rechts
    let angle = toFinish.toAngle() - (this.rotation - Math.PI / 2);
    angle = Math.atan2(Math.sin(angle), Math.cos(angle)); // auf -PI..PI bringen

    [this.gas, this.steer] = this.brain.predict([
      ...rays,
      this.speed / MAX_SPEED,
      angle / Math.PI,
      Math.min(distance / MAX_DISTANCE, 1),
    ]);
  }

  /**Berechnung der jeweiligen Fitness des Autos um verbesserung Messbar zu machen.
   * Hier jetzt mit wie groß die Entfernung zum Ziel ist einem großen Bonus fürs ankommen 
   * und der Dauer als abzug um natürlich schnelligkeit zu belohnen*/  
  public getFitness(): number {
    let fitness = this.startPos.distance(this.finishPos) - this.closest;
    if (this.state == "finished") {
      fitness += 1000 + (params.timeout - this.timeAlive / 1000) * 10;
    }
    if (this.state == "crashed") fitness -= 20;
    return fitness;
  }

  public getState(): State {
    return this.state;
  }

  public setBest(best: boolean): void {
    this.color = best ? COLOR_BEST : COLOR_NORMAL;
    this.z = best ? 2 : 1;
  }

  public crash(): void {
    this.done("crashed");
  }
  public timeout(): void {
    this.done("timeout");
  }
  public finish(): void {
    this.done("finished");
  }

  private done(state: State): void {
    this.state = state;
    this.speed = 0;
    this.vel = ex.Vector.Zero;
    this.graphics.opacity = state == "finished" ? 1 : 0.25;
    this.onDone(state);
  }

  public reset(): void {
    this.speed = 0;
    this.timeAlive = 0;
    this.state = "running";
    this.pos = this.startPos.clone();
    this.rotation = 0;
    this.vel = ex.Vector.Zero;
    this.gas = 0;
    this.steer = 0;
    this.closest = this.startPos.distance(this.finishPos);
    this.graphics.opacity = 0.8;
  }
}
