<script setup>
import { onMounted, reactive } from "vue";
import { Villain } from "./components/scripts/villain.js";
import { Bullet } from "./components/scripts/bullet.js";
import { createClient } from "@supabase/supabase-js";

const coins = reactive({ value:  0});
const enemy_arr = reactive({ enemies: [] });
const bullet_arr = reactive({ bullets: [] });
const game_over = reactive({ value: false });
const enemy_numbers = reactive({ value: 0 });
const bullet_numbers = reactive({ value: 0 });
const user = reactive({value: ""});
const client = createClient('https://qqrpgwergaafufadjxic.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcnBnd2VyZ2FhZnVmYWRqeGljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODE4OTYyMSwiZXhwIjoyMDMzNzY1NjIxfQ.jucj-WHPsaaS4BnwDdqJnZl3WD5RSB8SRzZ4HoceZik');

onMounted(async function getCoins() {
    user.value = window.Telegram.WebApp.initDataUnsafe.user.username;
    let {data, error} = await client.from('Users').select('coins').eq('user_id', user.value);
    console.log(error);
    if (data.length != 0){
        coins.value = parseInt(data[0].coins);
    }
    else{
        let {data, err} = await client.from('Users').select('coins');
        console.log(err);
        let id_c = data.length + 1;
        let error = await client.from('Users').insert([{id: id_c, user_id: user.value, coins: 0}]);
        console.log(error);
        getCoins();
    }
});

async function push_coin_changes(){
    let error = await client.from('Users').update({coins: parseInt(coins.value)}).eq('user_id', user.value);
    console.log(error);
}

setInterval(function spawn_enemy() {
    if (
        game_over.value == false &&
        document.getElementsByClassName("enemy").length <= 10
    ) {
        let x = new Villain();
        x.set_id(enemy_numbers.value);
        enemy_numbers.value += 1;
        enemy_arr.enemies.push(x);

        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.id = x.id;
        let gen_asset = Math.round((1+(Math.random()*(3))))
        enemy.style.backgroundImage = 'url(./assets/asteroid-'+gen_asset+'.png)';
        enemy.style.left = x.start_position_x + "px";
        document.getElementById("main").appendChild(enemy);
    }
}, 1000);

setInterval(function change_enemy_position() {
    let villains = document.getElementsByClassName("enemy");
    for (let i = 0; i < enemy_arr.enemies.length; i++) {
        let z = villains.namedItem(enemy_arr.enemies[i].id);
        enemy_arr.enemies[i].change_position();
        z.style.top = enemy_arr.enemies[i].start_position_y + "px";
        check_damage();
    }
}, 31);

setInterval(function check_overflow() {
    let villains = document.getElementsByClassName("enemy");
    for (let i = 0; i < enemy_arr.enemies.length; i++) {
        if (enemy_arr.enemies[i].start_position_y >= window.innerHeight - 213.6) {
            villains.namedItem(enemy_arr.enemies[i].id).remove();
            enemy_arr.enemies.splice(i, 1);
        }
    }
}, 1000);

setInterval(function spawn_bullet() {
    if (document.getElementsByClassName("bullet").length <= 10) {
        var hero = document.getElementById("spaceship");
        let x = new Bullet(hero.style.left);
        x.set_id(bullet_numbers.value);
        bullet_numbers.value += 1;
        bullet_arr.bullets.push(x);

        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.id = x.id;
        bullet.style.left = x.position_x + 44 + "px";
        bullet.style.top = x.starting_point + "px";
        document.getElementById("main").appendChild(bullet);
    }
}, 1000);

setInterval(function move_bullets() {
    let bullet_list = document.getElementsByClassName("bullet");
    for (let i = 0; i < bullet_arr.bullets.length; i++) {
        bullet_arr.bullets[i].change_position();
        if (bullet_arr.bullets[i].starting_point > 0) {
            bullet_list.namedItem(bullet_arr.bullets[i].id).style.top =
                bullet_arr.bullets[i].starting_point + "px";
            check_damage();
        } else {
            bullet_list.namedItem(bullet_arr.bullets[i].id).remove();
            bullet_arr.bullets.shift();
        }
    }
}, 31);

async function moveHero(e) {
    var hero = document.getElementById("spaceship");
    if (e.clientX){
        hero.style.left = e.clientX - 44 + "px";
        // hero.style.top = e.clientY+"px";
    }
    else{
        hero.style.left = e.touches[0].clientX;
    }
}

function check_damage() {
    for (let i = 0; i < bullet_arr.bullets.length; i++) {
        for (let j = 0; j < enemy_arr.enemies.length; j++) {
            if (
                bullet_arr.bullets[i] != undefined &&
                bullet_arr.bullets[i].position_x >=
                    enemy_arr.enemies[j].start_position_x - 44 &&
                bullet_arr.bullets[i].position_x <=
                    enemy_arr.enemies[j].start_position_x + 44 &&
                bullet_arr.bullets[i].starting_point <=
                    enemy_arr.enemies[j].start_position_y + 44
            ) {
                coins.value += 1;
                document
                    .getElementsByClassName("enemy")
                    .namedItem(enemy_arr.enemies[j].id)
                    .remove();
                enemy_arr.enemies.splice(j, 1);
                document
                    .getElementsByClassName("bullet")
                    .namedItem(bullet_arr.bullets[i].id)
                    .remove();
                bullet_arr.bullets.splice(i, 1);
                push_coin_changes();
            }
        }
    }
}
</script>

<template>
    <div v-if="game_over.value == false" id="main" @mousemove="moveHero">
        <div id="counter">{{ coins.value }}</div>
        <div id="spaceship"></div>
    </div>
</template>

<style>
#app {
    min-width: 100%;
    max-width: 100%;
    height: 100vh;
    background-image: url("./assets/background.png");
    background-size: cover;
    overflow: hidden;
}
#main {
    position: absolute;
    top: 0px;
    left: 0px;
    margin-left: 0px;
    min-width: 100%;
    max-width: 100%;
    min-height: 100vh;
}

#spaceship {
    width: 80px;
    height: 113.6px;
    cursor: pointer;
    position: absolute;
    bottom: 0px;
    background-image: url("./assets/spaceship.png");
    background-size: cover;
    opacity: 100%;
    z-index: 88;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.enemy {
    position: absolute;
    width: 80px;
    height: 88px;
    top: 0px;
    z-index: 100;
    background-size: cover;
    /* background-image: url("./assets/asteroid.png"); */
}

.bullet {
    position: absolute;
    width: 10px;
    height: 75.6px;
    background-size: cover;
    background-image: url("./assets/bullet.png");
    z-index: 50;
}

#counter {
    position: absolute;
    top: 0px;
    right: 0px;
    min-width: 80px;
    display: flex;
    justify-content: space-around;
    background-color: blueviolet;
    font-weight: bold;
    font-size: 22px;
    color: gold;
    border: 3px solid gold;
    border-radius: 7px;
}
</style>
