
export class Villain{
    speed = 2;
    start_position_x = 0;
    start_position_y = 0;
    id;
    constructor(){
        this.generate_position();
    }

    generate_position(){
        let x = window.innerWidth - 64;
        let result = 0+(Math.random()*(x-0));
        this.start_position_x =  Math.round(result);
    }

    change_position(){
        this.start_position_y += this.speed;
    }

    set_id(new_id){
        this.id = new_id;
    }
}