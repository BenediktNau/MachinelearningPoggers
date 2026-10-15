import { Car } from "../scripts/car/car";
import { Sensors } from "../scripts/mapCollision/sensors";
import { MapExportObj } from "./mapLoader";

export class GameCoordinator {
  constructor(numberOfCars: number, game: ex.Scene, map: MapExportObj) {
    this.numberOfCars = numberOfCars;
    this.game = game;

    for (let i = 0; i < numberOfCars; i++) {
        const car = new Car(map.spawn)
        const sensors = new Sensors(map, car);
        console.log("test")
        game.add(car);
        game.add(sensors);
    }

  }
  private game: ex.Scene;

  private numberOfCars: number;
  private cars: Car[] = [];
}
