export class Bullet{
    speed = 2;
    position_x;
    starting_point;
    id;

    constructor(point){
        this.starting_point = window.innerHeight-135.6;
        point = point.substring(0, point.length-2);
        this.position_x = parseFloat(point)-5;
    }

    set_id(id){
        this.id = id;
    }

    change_position(){
        this.starting_point -= this.speed;
    }
}