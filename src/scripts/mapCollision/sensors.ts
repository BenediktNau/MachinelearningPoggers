import { Actor, Color, Engine, ExcaliburGraphicsContext, Vector } from "excalibur";
import { MapExportObj } from "../../helper/mapLoader";
import { Car } from "../car/car";
import { getPixelColor, colorsMatch, RGBA } from "../../helper/colorChecker";
import { startGame } from "../../helper/game";

export class Sensors extends Actor {
  constructor(map: MapExportObj, car: Car) {
    super();
    this.map = map;
    this.car = car;
    if (this.map.canvas.getContext("2d") != null) {
      this.imageData = this.map.canvas
        .getContext("2d")!
        .getImageData(0, 0, this.map.canvas.width, this.map.canvas.height);
    } else this.imageData = new ImageData(0, 0);

    // Actor has no onPostDraw in Excalibur 0.32 -> hook into the GraphicsComponent
    this.graphics.onPostDraw = (ctx) => this.drawRays(ctx);
    // no graphic = empty bounds -> would be culled as offscreen
    this.graphics.forceOnScreen = true;
  }
  private map: MapExportObj;
  private car: Car;
  private imageData: ImageData;
  private sensorLength = 100;
  // relative to driving direction: left, front-left, front, front-right, right
  private sensorAngles = [-90, -45, 0, 45, 90].map((d) => (d * Math.PI) / 180);
  private rays: { start: Vector; end: Vector; distance: number; direction: Vector }[] = [];

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.car.getState() != "running") return;

    const currentBoxPoints = this.car.getCurrentBoxPoints()

    if (
      this.detectCollisionOnLine(
        currentBoxPoints.lt,
        currentBoxPoints.rt,
        { r: 0, g: 0, b: 255, a: 255 },
      ) >= 0
    ) {
      this.car.finish();
      return;
    }

    if (
      this.detectCollisionOnLine(
        currentBoxPoints.lt,
        currentBoxPoints.rt,
        { r: 0, g: 0, b: 0, a: 255 },
      ) >= 0
    ) {
      this.car.crash();
    }

    this.rays = this.sensorAngles.map((angle) => {
      const direction = Vector.fromAngle(this.car.rotation - Math.PI / 2 + angle);
      const start = this.car.pos;
      const end = start.add(direction.scale(this.sensorLength));
      const distance = this.detectCollisionOnLine(start, end, {
        r: 0, g: 0, b: 0, a: 255,
      });
      return { start, end, distance, direction };
    });
  }

  private drawRays(ctx: ExcaliburGraphicsContext): void {
    for (const ray of this.rays) {

      console.log(`Ray distance ${ray.distance}`);
      if (ray.distance < 0) {
        ctx.drawLine(ray.start, ray.end, Color.Green, 1);
      } else {
        const hit = ray.start.add(ray.direction.scale(ray.distance));
        ctx.drawLine(ray.start, hit, Color.Red, 1);
        ctx.drawCircle(hit, 2, Color.Red);
      }
    }
  }

  public getDistances = () => this.rays.map((r) => r.distance);

  public detectCollisionOnLine = (
    startPosition: Vector,
    endPosition: Vector,
    color: RGBA,
  ) => {
    const vectorLength = startPosition.distance(endPosition);
    const vector = endPosition.sub(startPosition);
    const richtung = vector.normalize();

    for (let i = 0; i < vectorLength; i+=0.1) {
      const coordsToTest = startPosition.add(richtung.scale(i));
      if (
        colorsMatch(getPixelColor(this.imageData, coordsToTest)!, color, 10)
      ) {
        return i;
      }
    }
    return -1;
  };
}
