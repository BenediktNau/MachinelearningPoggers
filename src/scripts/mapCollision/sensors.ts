import { Actor, Color, Engine, ExcaliburGraphicsContext, Vector } from "excalibur";
import { MapExportObj } from "../../helper/mapLoader";
import { Car } from "../car/car";
import { getPixelColor, colorsMatch, RGBA } from "../../helper/colorChecker";
import { params } from "../../AI/params";

const WALL: RGBA = { r: 0, g: 0, b: 0, a: 255 };
const RAY_FREE = new Color(74, 222, 128, 0.25);
const RAY_HIT = new Color(248, 113, 113, 0.6);

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

   
    this.graphics.onPostDraw = (ctx) => this.drawRays(ctx);
    this.graphics.forceOnScreen = true;
  }

  private map: MapExportObj;
  private car: Car;
  private imageData: ImageData;
  private sensorLength = 200;
  
  private sensorAngles = [-90,-70, -45, 0, 45,70, 90, 180].map((d) => (d * Math.PI) / 180);
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
      return;
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

    // neue position muss neues denken anstoßen
    this.car.think(
      this.rays.map((r) => (r.distance < 0 ? 1 : r.distance / this.sensorLength)),
    );
  }

  private drawRays(ctx: ExcaliburGraphicsContext): void {
    if (!params.showRays || this.car.getState() != "running") return;
    for (const ray of this.rays) {
      if (ray.distance < 0) {
        ctx.drawLine(ray.start, ray.end, RAY_FREE, 1);
      } else {
        const hit = ray.start.add(ray.direction.scale(ray.distance));
        ctx.drawLine(ray.start, hit, RAY_HIT, 1);
        ctx.drawCircle(hit, 1.5, RAY_HIT);
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

    // Schrittweite 1 Pixel reicht (die Karte ist ein Pixelraster) und ist bei vielen Autos deutlich schneller
    for (let i = 0; i < vectorLength; i += 1) {
      const coordsToTest = startPosition.add(richtung.scale(i));
      // außerhalb der Karte zählt als Wand, sonst fahren die Autos aus dem Bild
      if (
        colorsMatch(getPixelColor(this.imageData, coordsToTest) ?? WALL, color, 10)
      ) {
        return i;
      }
    }
    return -1;
  };
}
