import * as ex from 'excalibur'


export class Car extends ex.Actor{
    constructor(pos: {x: number, y:number}) {
        super({
            pos: ex.vec(pos.x,pos.y),
            width: 16,
            height: 20,
            color: ex.Color.Yellow
        })
    }

    

}