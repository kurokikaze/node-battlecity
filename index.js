var console = {};
console.log = require('sys').puts;
var child = require('child_process');
var events = require('events');

var battlecity = {};
//var doit = require('./do');

(function(){

    battlecity.enemies = {
        crawler: {
            speed: 1,
            mindset: function(map, players) {
                return {'turn':'d', 'move': true, 'shoot': true};
            }
        },
        runner: {
            speed: 2,
            mindset: function(map, players) {}
        },
        heavy: {
            speed: 1,
            mindset: function(map, players) {}
        },
        hunter: {
            speed: 1,
            mindset: function(map, players) {}
        },
        digger: {
            speed: 1,
            mindset: function(map, players) {}
        },
        vindicator: {
            speed: 1,
            mindset: function(map, players) {}
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
            {'x':0, 'y':0, 'cooldown': 4},
            {'x':13 * 4, 'y':0, 'cooldown': 4}
        ]

        var max_enemies = 2;

        var ai_pool = [];

        this.load_ai = function(id, tank_id, callback) {
            var ai = child.spawn('node', ['drone.js']);
            console.log('Starting drone');

            // Tell drone to load AI by id
            console.log('Sending load command');
            ai.stdin.write(JSON.stringify({'action':'load', 'id':id}));

            console.log('Adding status listener');
            ai.stdout.addListener('data', function(data) {
                console.log('Data from drone: ' + data);
                var order = {};

                try {
                    order = JSON.parse(data);
                } catch(e) {
                    sys.puts('Error parsing drone response');
                    callback(true);
                }

                if (order.status == 1) {
                    // Ready!

                    // prepare for game
                    // unload old listener
                    ai.stdout.removeAllListeners('data');

                    // load new, main orders listener
                    var orders_flow = new events.EventEmitter;

                    ai.stdout.addListener('data', function(data) {

                        try {
                            order = JSON.parse(data);
                        } catch(e) {
                            sys.puts('[P] message: ' + data + '; error: ' + e);
                            order = {};
                        }

                        console.log('Emitting incoming order');
                        orders_flow.emit('order', order);

                     });

                    var flow_request = function(map) {
                        if (ai.stdin.writeable == true) {
                            console.log('Stream is writeable');
                        } else {
                            console.log('Stream is non-writeable');
                        }
                        ai.stdin.on('drain', function() {
                            console.log('Stream drained');
                        });
                        var success = ai.stdin.write(JSON.stringify({'action' : 'request', 'map' : map}));
                        if (success) {
                            console.log('Write succesful');
                        }
                    }

                    orders_flow.die = function() {
                        ai.kill('SIGTERM');
                    }

                    orders_flow.safe_request = function(request, callback) {
                        var status = false;
                        var self_ai = this;

                        var timer = setTimeout(function() {
                            console.log('Safe request timeout');
                            if (!status) {
                                self_ai.removeAllListeners('order');
                                callback(true, {'status':'too long'});
                            }
                        }, 500);

                        this.addListener('order',function(order) {
                            clearTimeout(timer);
                            console.log('Safe request returned');
                            self_ai.removeAllListeners('order');
                            status = true;
                            callback(false, order);
                        });

                        flow_request(request);
                        console.log('Safe request issued');

                    }

                     // All right
                    callback(false, orders_flow);
                } else {
                    callback(true);
                }

            });

            //console.log('Adding exit listener');
            ai.stdout.addListener('exit', function() {
                sys.puts('AI closed connection');
            });

            //console.log('Adding err data listener');
            ai.stderr.on('data', function(data) {
                console.log('Err data: ' + data);
            });

            var action = {};


        }

        var tank = function(setx, sety, ai) {
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
                    //console.log('step');
                    this.step();
                }
            }

            this.step = function() {
                var possible = false;
                console.log('Going '+ direction);
                switch(direction) {
                    case 'u':
                        possible = self_map.checkAvailability(x, y - 1);
                        possible = possible && self_map.checkAvailability(x + 1, y - 1);
                        possible = possible && self_map.checkAvailability(x + 2, y - 1);
                        possible = possible && self_map.checkAvailability(x + 3, y - 1);
                            break;
                    case 'd':
                        possible = self_map.checkAvailability(x, y + 4);
                        possible = possible && self_map.checkAvailability(x + 1, y + 1);
                        possible = possible && self_map.checkAvailability(x + 2, y + 1);
                        possible = possible && self_map.checkAvailability(x + 3, y + 1);
                            break;
                    case 'l':
                        possible = self_map.checkAvailability(x - 1, y);
                        possible = possible && self_map.checkAvailability(x - 1, y + 1);
                        possible = possible && self_map.checkAvailability(x - 1, y + 2);
                        possible = possible && self_map.checkAvailability(x - 1, y + 3);
                            break;
                    case 'r':
                        possible = self_map.checkAvailability(x + 4, y);
                        possible = possible && self_map.checkAvailability(x + 4, y + 1);
                        possible = possible && self_map.checkAvailability(x + 4, y + 2);
                        possible = possible && self_map.checkAvailability(x + 4, y + 3);
                            break;
                }

                if (possible) {
                    //console.log('Movement is possible');

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

        for (var ssid in seed_spots) {
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (map[seed_spots[ssid].y + j][seed_spots[ssid].x + i] == '#') {

                    }
                }
            }
        }

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
        this.progress = function(callback) {
            // Создать противников, если нужно

            // Опросить и подвинуть танки игроков, проверить столкновения

            console.log('move');
            for (player_id in players) {
                players[player_id].cooldown();
                players[player_id].move(this);
                players[player_id].shoot(this);
            }

            console.log('enemies move');
            for (enemy_id in enemies) {
                var command = battlecity.enemies[enemies[enemy_id].type].mindset(map, players);

                if (command) {
                    if (command.move && command.move == true) {
                        enemies[enemy_id].move(this);
                    }

                    if (command.turn && command.turn != false) {
                        enemies[enemy_id].turn(command.turn);
                    }

                    if (command.shoot && command.shoot == true) {
                        enemies[enemy_id].shoot(this);
                    }
                }

            }

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
                        console.log('Boom!!!');

                        if (bullet.x < 1) {
                            bullet.x = 1;
                        }

                        if (bullet.y < 1) {
                            bullet.y = 1;
                        }

                        if (bullet.x > 12 * 4) {
                            bullet.x = 12 * 4;
                        }

                        if (bullet.y > 12 * 4) {
                            bullet.y = 12 * 4;
                        }

                        this.addExplosion(bullet.x - 1, bullet.y - 1);
                        delete bullets[bullet_id];
                    }

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
                        var enemy = new tank(seed_spots[sid].x, seed_spots[sid].y);
                        enemy.type = 'crawler';
                        enemies.push(enemy);
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


            // Paint on map
            for (var pid in players) {
                map_sub[parseInt(players[pid].position()[1])][players[pid].position()[0]] = 'T';
                map_sub[parseInt(players[pid].position()[1]) + 3][players[pid].position()[0]] = 'T';
                map_sub[parseInt(players[pid].position()[1])][players[pid].position()[0] + 3] = 'T';
                map_sub[parseInt(players[pid].position()[1]) + 3][players[pid].position()[0] +3] = 'T';
            }

            for (var eid in explosions) {
                map_sub[parseInt(explosions[eid].y)][explosions[eid].x] = '!';
                map_sub[parseInt(explosions[eid].y) + 3][explosions[eid].x] = '!';
                map_sub[parseInt(explosions[eid].y)][explosions[eid].x + 3] = '!';
                map_sub[parseInt(explosions[eid].y) + 3][explosions[eid].x +3] = '!';
            }

            for (var bid in bullets) {
                map_sub[bullets[bid].y][bullets[bid].x] = '*';
                map_sub[bullets[bid].y + 1][bullets[bid].x] = '*';
                map_sub[bullets[bid].y][bullets[bid].x + 1] = '*';
                map_sub[bullets[bid].y + 1][bullets[bid].x + 1] = '*';
            }

            for (var eid in enemies) {
                map_sub[parseInt(enemies[eid].position()[1])][enemies[eid].position()[0]] = '1';
                map_sub[parseInt(enemies[eid].position()[1]) + 3][enemies[eid].position()[0]] = '3';
                map_sub[parseInt(enemies[eid].position()[1])][enemies[eid].position()[0] + 3] = '2';
                map_sub[parseInt(enemies[eid].position()[1]) + 3][enemies[eid].position()[0] + 3] = '4';
            }

            // Show map on screen
            for (var row in map_sub) {
                console.log('' + map_sub[row].join(''));
            }
        }
    }

})();

exports.battlecity = battlecity;