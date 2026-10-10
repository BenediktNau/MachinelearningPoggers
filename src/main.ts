import * as ex from 'excalibur'
import { Car } from './car/car';
import { handleMapUpload } from './helper/mapLoader';

const fileInput = document.querySelector<HTMLInputElement>("#fileInput");
const width = 500;
const height = 500;


fileInput?.addEventListener("change", (event) => handleMapUpload(event, height, width));

const game = new ex.Engine({
    width: 500,
    height: 500,
    pixelArt: true,
    pixelRatio: 2,
    displayMode: ex.DisplayMode.FitScreen
});

const car = new Car();
game.add(car);

game.start();