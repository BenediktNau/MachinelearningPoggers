import { Actor, Color, Engine, vec, Vector } from "excalibur";
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
  }
  private map: MapExportObj;
  private car: Car;
  private imageData: ImageData;

  onPreUpdate(engine: Engine, elapsed: number):  void {
    if (
      this.detectCollisionOnLine(
        this.car.getCurrentBoxPoints().lt,
        this.car.getCurrentBoxPoints().rt,
        { r: 0, g: 0, b: 255, a: 255 },
      ) >= 0
    ) {
        this.car.finish();
    }

    if (
      this.detectCollisionOnLine(
        this.car.getCurrentBoxPoints().lt,
        this.car.getCurrentBoxPoints().rt,
        { r: 0, g: 0, b: 0, a: 255 },
      ) >= 0
    ) {
        this.car.crash();
    }
  }

  public detectCollisionOnLine = (
    startPosition: Vector,
    endPosition: Vector,
    color: RGBA,
  ) => {
    const vectorLength = startPosition.distance(endPosition);
    const vector = endPosition.sub(startPosition);
    const richtung = vector.normalize();

    for (let i = 0; i < vectorLength; i++) {
      const coordsToTest = floorVec(startPosition.add(richtung.scale(i)));
      if (
        colorsMatch(getPixelColor(this.imageData, coordsToTest)!, color, 10)
      ) {
        return i;
      }
    }
    return -1;
  };
}

const floorVec = (vector: Vector) => {
  return new Vector(Math.floor(vector.x), Math.floor(vector.y));
};
