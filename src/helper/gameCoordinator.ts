import { Car } from "../scripts/car/car";
import { State } from "../scripts/car/Icar";
import { Sensors } from "../scripts/mapCollision/sensors";
import { MapExportObj } from "./mapLoader";

export class GameCoordinator {
  constructor(numberOfCars: number, game: ex.Scene, map: MapExportObj) {
    this.numberOfCars = numberOfCars;
    this.game = game;

    for (let i = 0; i < numberOfCars; i++) {
      const car = new Car(map.spawn, this.checkCrash);
      const sensors = new Sensors(map, car);

      game.add(car);
      game.add(sensors);
    }
  }
  private game: ex.Scene;

  private numberOfCars: number;
  private cars: Car[] = [];

  private checkCrash: (state: State) => void = (state: State) => {
    if (this.cars.find((c) => c.getState() == "running") === undefined) {
      this.cars.forEach((car) => car.reset());
    }
  };
}
