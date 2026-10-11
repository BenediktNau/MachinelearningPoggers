import * as ex from "excalibur";
import { MapExportObj } from "./mapLoader";
import { Car } from "../car/car";

export const startGame = (Map: MapExportObj, game: ex.Engine<any>) => {
  game.removeScene("map");
  loadMap(Map, game);
  game.goToScene("map")

  const car = new Car();
  game.add(car);
};

const loadMap = (Map: MapExportObj, game: ex.Engine<any>) => {
  const newMap = new ex.Scene();

  const mapCanvas = new ex.Canvas({
    width: game.drawWidth,
    height: game.drawHeight,
    cache: true,
    draw: (ctx) => ctx.drawImage(Map.canvas,0,0)
  });
  

  game
  const loader = new ex.Loader([Map.canvas.])


  newMap.add()
  game.add("map", newMap);
};
