import * as ex from 'excalibur'


export class Car extends ex.Actor{
    constructor() {
        super({
            pos: ex.vec(200,300),
            width: 16,
            height: 20,
            color: ex.Color.Yellow
        })
    }

    

}