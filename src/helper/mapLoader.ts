
export class MapExportObj {
    public canvas: OffscreenCanvas;
    public spawn: { x: number; y: number };
    public finish: { x: number; y: number };

    constructor(canvas: OffscreenCanvas, spawn: { x: number; y: number }, finish: { x: number; y: number }){
        this.canvas = canvas;
        this.finish = finish;
        this.spawn = spawn;
    }
}

export const handleMapUpload = async (
  event: Event,
  gameHeight: number,
  gameWidth: number,
) => {
  //Hier nehmen wir den Input dementsprechend das Geuploadede
  const input = event.currentTarget;
  
  let Map = new MapExportObj(new OffscreenCanvas(0,0), {x:50,y:50}, {x:450,y:450})

  //Wenn es kein HTMLInputElement ist schmeißen wirs einfach weg
  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  //Hier suchen wir uns die Datei raus die wir hochgeladen haben
  const files = input.files;
  const file = files?.item(0) || null;

  //Auslesen des ArrayBuffers
  const content: ArrayBuffer = await file!.arrayBuffer();
  console.log(content);

  //überführen in ein Binary Large Object
  const blob = new Blob([content]);

  //aus dem Blob erstellen wir eine Bitmap um dann die Maße auszulesen
  const bitmap = await createImageBitmap(blob);

  //Offscreen das Image erstellen, um Start und Ziel abzufragen und image auf Spielgröße zu bringen

  const canvas = new OffscreenCanvas(gameWidth, gameHeight);
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bitmap, gameWidth, gameHeight);
    const SpawnCoords = FindSpawn(ctx, gameWidth, gameHeight);
    const FinishCoords = FindFinish(ctx, gameWidth, gameHeight);
    
    //Aufräumen der Bitmap
    bitmap.close();

    //Export Objekt erstellen
    Map.canvas = ctx.canvas;
    Map.spawn = SpawnCoords;
    Map.finish = FinishCoords;
  }

  return Map;
};

const FindSpawn: (
  canvas: OffscreenCanvasRenderingContext2D,
  gameWidth: number,
  gameHeight: number,
) => { x: number; y: number } = (canvas, gameWidth, gameHeight) => {
  const imgData = canvas.getImageData(0, 0, gameWidth, gameHeight);

  //Array durch gehen und ersten Block Rot finden
  for (let y = 0; y < gameHeight; y++) {
    for (let x = 0; x < gameWidth; x++) {
      if (imgData.data[4 * (y * gameWidth + x)] == 255) {
        return { x, y };
      }
    }
  }
  return { x: 50, y: 50 };
};

const FindFinish: (
  canvas: OffscreenCanvasRenderingContext2D,
  gameWidth: number,
  gameHeight: number,
) => { x: number; y: number } = (canvas, gameWidth, gameHeight) => {
  const imgData = canvas.getImageData(0, 0, gameWidth, gameHeight);

  //Array durch gehenm und ersten Block Blau finden
  for (let y = 0; y < gameHeight; y++) {
    for (let x = 0; x < gameWidth; x++) {
      if (imgData.data[4 * (y * gameWidth + x) + 2] == 255) {
        console.log("Found Finishline at: X:" + x + " Y:" + y);
        return { x, y };
      }
    }
  }
  return { x: 50, y: 50 };
};

