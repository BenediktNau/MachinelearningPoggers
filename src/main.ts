import * as ex from "excalibur";
import { Car } from "./car/car";
import { handleMapUpload, MapExportObj } from "./helper/mapLoader";
import { startGame } from "./helper/game";

const fileInput = document.querySelector<HTMLInputElement>("#fileInput");
const width = 500;
const height = 500;

const game = new ex.Engine({
    width: 500,
    height: 500,
    pixelRatio: 2,
  });

game.start();

game.add(new ex.Label({
    text: "Lade bitte eine Karte hoch"
}))

fileInput?.addEventListener("change", async (event) => {
  const Map = await handleMapUpload(event, height, width);

  if (Map) {
    startGame(Map,game);
  }
});
