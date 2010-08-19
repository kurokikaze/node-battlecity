var console = {};
console.log = require('sys').puts;


var battlecity = {};
//var doit = require('./do');

(function(){

    battlecity.enemies = {
        crawler: {
            speed: 1,
            mindset: function() {}
        },
        runner: {
            speed: 2,
            mindset: function() {}
        },
        heavy: {
            speed: 1,
            mindset: function() {}
        },
        hunter: {
            speed: 1,
            mindset: function() {}
        },
        digger: {
            speed: 1,
            mindset: function() {}
        },
        vindicator: {
            speed: 1,
            mindset: function() {}
        }
    }

    battlecity.map = function(map_array) {
        // ' ' : Ничего
        // 'f' : Лес
        // 'w' : Вода
        // '#' : Кирпичи
        // 'C' : Бетон
        // 'i' : Лёд

        var map_array = [[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#','#','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         ['#','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' ',' ',' '],
                         ['#','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         ['#','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']];



        var map = [
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [],[],[],[],[],[],[],[],[],[],[],[],[]
        ];

        var self_map = this;

        var seed_spots = [
            {'x':1, 'y':1, 'cooldown': 4},
            {'x':13 * 4, 'y':1, 'cooldown': 4}
        ]

        var max_enemies = 2;

        var tank = function(setx, sety) {
            var x = setx | 0;
            var y = sety | 0;

            var danger_counter = 3;
            var danger_cooldown = 10;

            var direction = 'u';
            var state = true;

            // Statistics
            var odometer = 0;
            var bullets_shot = 0;

            var speed = 1;
            var gunheat = 0;

            this.turn = function(new_direction) {
                direction = new_direction;
            }

            this.move = function() {
                for (var i = 0; i < speed; i++) {
                    console.log('step');
                    this.step();
                }
            }

            this.step = function() {
                var possible = false;
                console.log('Going '+ direction);
                switch(direction) {
                    case 'u':
                        possible = self_map.checkAvailability(x, y - 1);
                            break;
                    case 'd':
                        possible = self_map.checkAvailability(x, y + 1);
                            break;
                    case 'l':
                        possible = self_map.checkAvailability(x - 1, y);
                            break;
                    case 'r':
                        possible = self_map.checkAvailability(x + 1, y);
                            break;
                }

                if (possible) {
                    console.log('Movement is possible');

                    switch(direction) {
                        case 'u':
                            y = y - 1;
                            break;
                        case 'd':
                            y = y + 1;
                            break;
                        case 'l':
                            x = x - 1;
                            break;
                        case 'r':
                            x = x + 1;
                            break;
                    }

                    odometer++;
                }

                return possible;
            }

            this.shoot = function() {
                if (gunheat == 0) {
                    bullet_x = x;
                    bullet_y = y;
                    switch(direction) {
                        case 'u':
                            bullet_y -=  2;
                            bullet_x +=  1;
                            break;
                        case 'd':
                            bullet_y += 4;
                            bullet_x +=  1;
                            break;
                        case 'l':
                            bullet_x -= 2;
                            bullet_y += 1;
                            break;
                        case 'r':
                            bullet_x += 2;
                            bullet_y +=  1;
                            break;
                    }
                    self_map.addBullet(bullet_x, bullet_y, direction);

                    bullets_shot++;
                    gunheat = 10;
                }
            }

            this.cooldown = function() {
                if (gunheat > 0) {
                    gunheat -= 1;
                }
            }

            this.position = function() {
                return [x, y];
            }

            this.damage = function() {
                state = false;
                return false;
            }

            this.alive = function() {
                return state;
            }

            this.stats = function() {
                return {'move':odometer, 'shot':bullets_shot};
            }
        }

        var bullets = [];
        var explosions = [];

        var turn_number = 1;

        // Загружаем карту
        for (var row in map_array) {
            for (var column in map_array[row]) {
                // Каждый квадрат карты это 16 квадратов поля
                for (var i = 0; i<4; i++) {
                    for (var j = 0; j<4; j++) {
                        map[(parseInt(row) * 4)  + parseInt(i)][(parseInt(column) * 4) + parseInt(j)] = map_array[row][column];
                    }
                }
            }
        }

        for (var i = 0; i<6; i++) {
            for (var j = 0; j<8; j++) {
                if (i < 2 || j < 2 || j >= 6) {
                    map[(12 * 4) - 2 + parseInt(i)][(6 * 4) - 2 + parseInt(j)] = '#';
                } else {
                    map[(12 * 4) - 2 + parseInt(i)][(6 * 4) - 2 + parseInt(j)] = 'E';
                }
            }
        }

//        map[7][13] = 'E'; // Place eagle

        var players = [];
        var enemies = [];

        var self = this;

        // Загружаем игроков
        players.push(new tank(0, 48));
        players.push(new tank(32 ,48));

        this.checkAvailability = function(x, y) {
            console.log('Testing ' + x + ', ' + y);
            if (x < 0 || x > (4*13) || y < 0 || y > (4*13)) {
                console.log('Out of bounds');
                return false;
            }

            if (map[y][x] === ' ' || map[y][x] === 'f') {
                console.log('Passable');
                return true;
            } else {
                console.log('Impassable : ' + map[y][x]);
                return false;
            }


        }

        this.getMapSquare = function(x, y) {
            if (x < 0 || x > (4*13) || y < 0 || y > (4*13)) {
                return false;
            } else {
                return map[y][x];
            }

        }


        var BulletHitSomething = function(bullet) {

            console.log('Bullet-testing ' + bullet.x + ', ' + bullet.y);

            var hit = false;

            // Мы попали в объект карты?
            if (self_map.getMapSquare(bullet.x, bullet.y) == '#' ||
                self_map.getMapSquare(bullet.x, bullet.y + 1) == '#' ||
                self_map.getMapSquare(bullet.x + 1, bullet.y) == '#' ||
                self_map.getMapSquare(bullet.x + 1, bullet.y + 1) == '#' ||

                self_map.getMapSquare(bullet.x, bullet.y) == 'E' ||         //
                self_map.getMapSquare(bullet.x, bullet.y + 1) == 'E' ||     // У кого то проблемы
                self_map.getMapSquare(bullet.x + 1, bullet.y) == 'E' ||     //
                self_map.getMapSquare(bullet.x + 1, bullet.y + 1) == 'E' || //

                self_map.getMapSquare(bullet.x, bullet.y) == 'C' ||
                self_map.getMapSquare(bullet.x, bullet.y + 1) == 'C' ||
                self_map.getMapSquare(bullet.x + 1, bullet.y) == 'C' ||
                self_map.getMapSquare(bullet.x + 1, bullet.y + 1) == 'C') {

                console.log('We hit the wall');
                hit = true;
            }

            // Мы попали в игрока?
            for (player in players) {
                if (Math.abs(bullet.x - players[player].x + 3) <= 2 && Math.abs(bullet.y - players[player].y + 3) <= 2) {
                    // Да, попали
                    hit = true;
                    console.log('We hit the player tank');
                }
            }


            return hit;
        }

        this.addBullet = function(x, y, direction) {
            bullets.push({'x':x, 'y':y, 'dir':direction});
        }

        this.addExplosion = function(x, y, direction) {

            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (self_map.getMapSquare( x + j, y + i) == '#') {
                        map[y + i][x + j] = ' ';
                    }
                }
            }
            console.log('BOOM');
            explosions.push({'x':x, 'y':y, 'frame': 3});
        }

        // Содержание хода
        this.progress = function() {
            // Создать противников, если нужно

            // Опросить и подвинуть танки игроков, проверить столкновения
            console.log('move');
            for (player_id in players) {
                players[player_id].cooldown();
                players[player_id].move(this);
                players[player_id].shoot(this);
            }

            console.log('enemies move');

            console.log('bullets');
            // Подвинуть пули (4 раза),..
            for (var n = 0; n < 4; n++) {
                // ...проверить не попали ли в кого нибудь
                for (var bullet_id in bullets) {

                    var bullet = bullets[bullet_id];

                    var possible = false;

                    switch(bullet.dir) {
                        case 'u':
                            possible = this.checkAvailability(bullet.x, bullet.y - 1);
                            break;
                        case 'd':
                            possible = this.checkAvailability(bullet.x, bullet.y + 1);
                            break;
                        case 'l':
                            possible = this.checkAvailability(bullet.x - 1, bullet.y);
                            break;
                        case 'r':
                            possible = this.checkAvailability(bullet.x + 1, bullet.y);
                            break;
                        default:
                            console.log('Strange direction: ' + bullet.dir);
                    }

                    if (possible) {
                        switch(bullet.dir) {
                            case 'u':
                                bullet.y = bullet.y - 1;
                            break;
                            case 'd':
                                bullet.y = bullet.y + 1;
                            break;
                            case 'l':
                                bullet.x = bullet.x - 1;
                            break;
                            case 'r':
                                bullet.x = bullet.x + 1;
                            break;
                        }

                    } else {

    //                    if (BulletHitSomething(bullet)) {
                            console.log('Boom!!!');
                            this.addExplosion(bullet.x - 1, bullet.y - 1);
                            delete bullets[bullet_id];

    //                    }
                    }

                    /*for (var player in players) {
                        var pos = players[player].position();
                        // Если попали...
                        if (Math.abs(bullet.x - pos.x) < 3 && Math.abs(bullet.y - pos.y) < 3 ) {
                            console.log('Player ' + player + ' damaged by bullet');
                            if (!players[player].damage()) {
                                // Последнюю статистику забираем
                                var stats = players[player].stats();
                                stats.survived = turn_number;
                                unset(players[player]);
                            }

                        }
                    }*/
                }
            }

            // explosions
            for (var eid in explosions) {
                explosions[eid].frame--;
                if (explosions[eid].frame < 0) {
                    delete explosions[eid];
                }
            }

            // Enemy spawning
            for (var sid in seed_spots) {
                if (seed_spots[sid].cooldown > 0) {
                    seed_spots[sid].cooldown -= 1;
                } else {
                    // How much enemies are there?
                    if (enemies.length < max_enemies) {
                        seed_spots[sid].cooldown = 10;
                        enemies.push({'x':seed_spots[sid].x,'y':seed_spots[sid].y, 'type':'crawler'});
                        console.log('Crawler spawned at ' + seed_spots[sid].x + ', ' + seed_spots[sid].y);
                    }

                }
            }

            console.log('end');
            // Конец хода
            turn_number++;
        }

        this.status = function() {
            return {
                'turn':turn_number,
                'bullets':bullets,
                'player1':players[0].position(),
                'player2':players[1].position()
            };
        }

        this.showmap = function() {
            var map_sub = [];

            for (var rid in map) {
                map_sub[rid] = map[rid].slice(0);
            }

            for (var row in map_sub) {

                for (var pid in players) {
                    if (players[pid].position()[1] == row) {
                        map_sub[parseInt(row)][players[pid].position()[0]] = 'T';
                        map_sub[parseInt(row) + 3][players[pid].position()[0]] = 'T';
                        map_sub[parseInt(row)][players[pid].position()[0] + 3] = 'T';
                        map_sub[parseInt(row) + 3][players[pid].position()[0] +3] = 'T';
                    }
                }

                for (var eid in explosions) {
                    if (explosions[eid].y == row) {
                        map_sub[parseInt(row)][explosions[eid].x] = '!';
                        map_sub[parseInt(row) + 3][explosions[eid].x] = '!';
                        map_sub[parseInt(row)][explosions[eid].x + 3] = '!';
                        map_sub[parseInt(row) + 3][explosions[eid].x +3] = '!';
                    }
                }

                for (var bid in bullets) {
                    if (bullets[bid].y == row) {

                        map_sub[bullets[bid].y][bullets[bid].x] = '*';
                        map_sub[bullets[bid].y + 1][bullets[bid].x] = '*';
                        map_sub[bullets[bid].y][bullets[bid].x + 1] = '*';
                        map_sub[bullets[bid].y + 1][bullets[bid].x + 1] = '*';
                    }
                }
                console.log(':' + map_sub[row].join(''));
            }
        }
    }

})();

exports.battlecity = battlecity;