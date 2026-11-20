import * as ex from "excalibur";
import { handleMapUpload, MapExportObj } from "./helper/mapLoader";
import { startGame } from "./helper/game";
import { GameCoordinator } from "./helper/gameCoordinator";
import { DrivingNetwork } from "./AI/Input";
import { params } from "./AI/params";

const fileInput = document.querySelector<HTMLInputElement>("#fileInput");
const importInput = document.querySelector<HTMLInputElement>("#importInput");
const width = 500;
const height = 500;

const game = new ex.Engine({
  canvasElementId: "game",
  width: 500,
  height: 500,
  pixelRatio: 2,
  backgroundColor: ex.Color.fromHex("#1e293b"),
});

game.start();

game.add(
  new ex.Label({
    text: "Lade bitte eine Karte hoch",
    pos: ex.vec(250, 250),
    color: ex.Color.White,
    font: new ex.Font({ size: 20, textAlign: ex.TextAlign.Center }),
  }),
);

let currentMap: MapExportObj | undefined;
let coordinator: GameCoordinator | undefined;

const start = async (seed?: DrivingNetwork) => {
  if (currentMap) coordinator = await startGame(currentMap, game, seed);
};

fileInput?.addEventListener("change", async (event) => {
  currentMap = await handleMapUpload(event, height, width);
  start();
});

// ---------- Parameter: jedes <input data-param="..."> schreibt direkt in params ----------

document.querySelectorAll<HTMLInputElement>("[data-param]").forEach((input) => {
  const key = input.dataset.param as keyof typeof params;
  const output = input.closest("label")?.querySelector("output");
  const isCheckbox = input.type == "checkbox";

  if (isCheckbox) input.checked = params[key] as boolean;
  else input.value = String(params[key]);
  if (output) output.textContent = input.value;

  input.addEventListener("input", () => {
    (params[key] as number | boolean) = isCheckbox ? input.checked : Number(input.value);
    if (output) output.textContent = input.value;
  });
});

// ---------- Anzeige: Statistik + Zeitraffer jeden Frame übernehmen ----------

const statFields = document.querySelectorAll<HTMLElement>("[data-stat]");

game.on("postupdate", () => {
  game.timescale = params.simSpeed;
  if (!coordinator) return;

  const stats = coordinator.getStats();
  const text: Record<string, string> = {
    generation: String(stats.generation),
    running: `${stats.running} / ${stats.population}`,
    lastFinished: String(stats.lastFinished),
    lastFitness: stats.lastFitness.toFixed(0),
    bestFitness: stats.bestFitness.toFixed(0),
  };
  statFields.forEach((el) => (el.textContent = text[el.dataset.stat!]));
});

// ---------- Neustart / Export / Import ----------

document.querySelector("#restartBtn")?.addEventListener("click", () => start());

document.querySelector("#exportBtn")?.addEventListener("click", () => {
  if (!coordinator) return;
  const json = JSON.stringify(coordinator.getBest().toJSON(), null, 2);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  link.download = `model-gen${coordinator.getStats().generation}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

importInput?.addEventListener("change", async () => {
  const file = importInput.files?.item(0);
  if (!file) return;
  start(DrivingNetwork.fromJSON(JSON.parse(await file.text())));
  importInput.value = "";
});
