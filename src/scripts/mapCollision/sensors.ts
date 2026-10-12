import { Actor, Color, Engine, Vector } from "excalibur";
import { MapExportObj } from "../../helper/mapLoader";
import { carCorners } from "../car/Icar";
import { Car } from "../car/car";

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

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (
      this.detectCollisionOnLine(this.car.getCurrentBoxPoints().lt, this.car.getCurrentBoxPoints().rt, 2) >= 0
    ) {
        console.log("collision")
    
    }
  }

  public detectCollisionOnLine = (
    startPosition: Vector,
    endPosition: Vector,
    color: number,
  ) => {
    const vectorLength = startPosition.distance(endPosition);
    const vector = endPosition.sub(startPosition);
    const richtung = vector.normalize();

    for (let i = 0; i < vectorLength; i++) {
      const coordsToTest = startPosition.add(richtung.scale(i));
      const x = coordsToTest.x;
      const y = coordsToTest.y;
      if ((y * this.imageData.width + x) * 4 + color == 255) {
        
        return i;
      } else {
        console.log(i)
        return -1;
      }
    }
    return -1;
  };
}
