import * as ex from "excalibur";
import { DrivingNetwork } from "../AI/Input";
import { params } from "../AI/params";
import { Car } from "../scripts/car/car";
import { Sensors } from "../scripts/mapCollision/sensors";
import { MapExportObj } from "./mapLoader";

export class GameCoordinator {
  /**
   * @param seed optional ein importiertes Netz: Auto 0 bekommt es unverändert, alle anderen eine mutierte Kopie
   */
  constructor(game: ex.Scene, map: MapExportObj, seed?: DrivingNetwork) {
    for (let i = 0; i < params.population; i++) {
      let brain = new DrivingNetwork(params.hiddenSize);
      if (seed) brain = i == 0 ? seed.clone() : this.child(seed);

      const car = new Car(map.spawn, map.finish, brain, this.checkCrash);
      const sensors = new Sensors(map, car);
      this.cars.push(car);

      game.add(car);
      game.add(sensors);
    }
    this.best = this.cars[0].brain;
  }

  private cars: Car[] = [];
  private best: DrivingNetwork; // bestes Netz der letzten Generation
  private generation = 1;
  private lastFitness = 0;
  private bestFitness = 0;
  private lastFinished = 0;

  // Wird von jedem Auto aufgerufen, sobald es gecrasht, im Ziel oder im Timeout ist
  private checkCrash = () => {
    if (this.cars.find((c) => c.getState() == "running") === undefined) {
      this.nextGeneration();
    }
  };

  private child(parent: DrivingNetwork): DrivingNetwork {
    return parent.clone().mutate(params.mutationRate, params.mutationStrength);
  }

  private nextGeneration(): void {
    // 1. Bewerten: beste Autos nach vorne
    const ranked = [...this.cars].sort((a, b) => b.getFitness() - a.getFitness());
    const elite = Math.max(1, Math.min(params.elite, ranked.length));
    const parents = ranked.slice(0, elite).map((c) => c.brain);

    this.best = parents[0];
    this.lastFitness = ranked[0].getFitness();
    this.bestFitness = Math.max(this.bestFitness, this.lastFitness);
    this.lastFinished = this.cars.filter((c) => c.getState() == "finished").length;
    this.generation++;

    // 2. Neue Generation: die Elite bleibt unverändert,
    //    alle anderen sind mutierte Kopien eines zufälligen Elite-Autos
    this.cars.forEach((car, i) => {
      car.brain =
        i < elite
          ? parents[i]
          : this.child(parents[Math.floor(Math.random() * elite)]);
      car.setBest(i == 0);
      car.reset();
    });
  }

  public getStats() {
    return {
      generation: this.generation,
      running: this.cars.filter((c) => c.getState() == "running").length,
      population: this.cars.length,
      lastFitness: this.lastFitness,
      bestFitness: this.bestFitness,
      lastFinished: this.lastFinished,
    };
  }

  //Export der besten Gewichte
  public getBest(): DrivingNetwork {
    return this.best;
  }
}
