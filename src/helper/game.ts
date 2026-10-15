import * as ex from "excalibur";
import { MapExportObj } from "./mapLoader";
import { Car } from "../scripts/car/car";
import { Sensors } from "../scripts/mapCollision/sensors";

export const startGame = async (Map: MapExportObj, game: ex.Engine<any>) => {
  await game.goToScene("root");
  game.removeScene("map");
  loadMap(Map, game);

  await game.goToScene("map");
  
};

const loadMap = (Map: MapExportObj, game: ex.Engine<any>) => {
  const newMap = new ex.Scene();
  const car = new Car(Map.spawn);
  const sensors = new Sensors(Map, car);


  const mapCanvas = new ex.Canvas({
    width: 500,
    height: 500,
    cache: true,
    draw: (ctx) => ctx.drawImage(Map.canvas, 0, 0),
  });

  const mapActor = new ex.Actor({
    anchor: ex.vec(0, 0),
    graphic: mapCanvas,
  });

  newMap.add(mapActor);

  newMap.add(sensors);
  newMap.add(car);
  game.add("map", newMap);

};
