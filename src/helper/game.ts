import * as ex from "excalibur";
import { MapExportObj } from "./mapLoader";
import { GameCoordinator } from "./gameCoordinator";

import { DrivingNetwork } from "../AI/Input";

export const startGame = async (
  Map: MapExportObj,
  game: ex.Engine<any>,
  seed?: DrivingNetwork,
) => {
  await game.goToScene("root");
  game.removeScene("map");
  const coordinator = loadMap(Map, game, seed);

  await game.goToScene("map");
  return coordinator;
};

const loadMap = (Map: MapExportObj, game: ex.Engine<any>, seed?: DrivingNetwork) => {
  const newMap = new ex.Scene();

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
  const coordinator = new GameCoordinator(newMap, Map, seed);

  game.add("map", newMap);
  return coordinator;
};
