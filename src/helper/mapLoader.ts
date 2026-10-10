
export const handleMapUpload = async (event: Event, gameHeight: number, gameWidth: number) => {
    //Hier nehmen wir den Input dementsprechend das Geuploadede
    const input = event.currentTarget;

    //Wenn es kein HTMLInputElement ist schmeißen wirs einfach weg
    if(!(input instanceof HTMLInputElement)){
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
    const bitmap = await createImageBitmap(blob)

    const Pwidth = bitmap.width;
    const Pheight = bitmap.height;

    const Pratio = Pwidth/Pheight;
    const Gratio = gameWidth/gameHeight; 

    for(var y = 0; gameHeight>y; y++){
        for(var x = 0; gameWidth>x; x++){

        }
    }




    bitmap.close();

    return await content;

}



const calculateWorld = () => {

}