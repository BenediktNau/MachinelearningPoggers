import * as ex from "excalibur";
import { MapExportObj } from "./mapLoader";
import { Car } from "../car/car";

export const startGame = async (Map: MapExportObj, game: ex.Engine<any>) => {
  await game.goToScene("root")
  game.removeScene("map");
  loadMap(Map, game);
  await game.goToScene("map")

  const car = new Car(Map.spawn);
  game.add(car);
};

const loadMap = (Map: MapExportObj, game: ex.Engine<any>) => {
  const newMap = new ex.Scene();

  const mapCanvas = new ex.Canvas({
    width: 500,
    height: 500,
    cache: true,
    draw: (ctx) => ctx.drawImage(Map.canvas,0,0)
  });

  const mapActor = new ex.Actor({
    anchor: ex.vec(0,0), 
    graphic: mapCanvas
  })


  newMap.add(mapActor)
  game.add("map", newMap);
};
