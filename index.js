var battlecity = {};

(function(){

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
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ','#',' ','#',' ',' ',' ',' ',' ','#',' ','#',' '],
                         [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']];



        var map = [
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [],[],[],[],[],[],[],[],[],[],[],[],[],
            [],[],[],[],[],[],[],[],[],[],[],[],[]
        ];

        var bullets = [];

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

        var players = [];

        // Загружаем игроков
        players.push(new tank(0, 48));
        players.push(new tank(32 ,48));

        this.checkAvailability = function(x, y) {
            console.log('Testing ' + x + ', ' + y);
            if (x < 0 || x > (4*13) || y < 0 || y > (4*13)) {
                console.log('Out of bounds');
                return false;
            }

            if (map[x][y] === ' ' || map[x][y] === 'f') {
                console.log('Passable');
                return true;
            } else {
                console.log('Impassable : ' + map[x][y]);
                return false;
            }


        }

        this.addBullet = function(x, y, direction) {
            bullets.push({'x':x, 'y':y, 'dir':direction});
        }

        // Содержание хода
        this.progress = function() {
            // Создать противников, если нужно

            // Опросить и подвинуть танки игроков, проверить столкновения
            console.log('move');
            for (player_id in players) {
                players[player_id].move(this);
            }

            console.log('bullets');
            // Подвинуть пули (4 раза),..
            // ...проверить не попали ли в кого нибудь
            for (var bullet_id in bullets) {

                bullet = bullets[bullet_id];

                var possible = false;

                switch(bullet.dir) {
                    case 'u':
                        possible = map.checkAvailability(bullet.x, bullet.y - 1);
                        break;
                    case 'd':
                        possible = map.checkAvailability(bullet.x, bullet.y + 1);
                        break;
                    case 'l':
                        possible = map.checkAvailability(bullet.x - 1, bullet.y);
                        break;
                    case 'r':
                        possible = map.checkAvailability(bullet.x + 1, bullet.y);
                        break;
                }

                if (possible) {
                    switch(bullet.dir) {
                        case 'u':
                            bullets[bullet_id].y = bullet.y - 1;
                        break;
                        case 'd':
                            bullets[bullet_id].y = bullet.y + 1;
                        break;
                        case 'l':
                            bullets[bullet_id].x = bullet.x - 1;
                        break;
                        case 'r':
                            bullets[bullet_id].x = bullet.x + 1;
                        break;
                    }

                } else {
                    // Стена! Пока просто уберём пулю
                    unset(bullets[bullet_id]);
                }

                for (var player in players) {
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
                }
            }

            console.log('end');
            // Конец хода
            turn_number++;
        }

        this.status = function() {
            return {
                'turn':turn_number,
                'bullets':bullets.length,
                'player1':players[0].position(),
                'player2':players[1].position()
            };
        }

        this.showmap = function() {
            for (row in map) {
                console.log(':' + map[row].join(''));
            }
        }
    }

    var tank = function(setx, sety) {
        var x = setx | 0;
        var y = sety | 0;

        var direction = 'u';
        var state = true;

        // Statistics
        var odometer = 0;
        var bullets_shot = 0;

        var speed = 1;

        this.turn = function(new_direction) {
            direction = new_direction;
        }

        this.move = function(map) {
            for (var i = 0; i < speed; i++) {
                console.log('step');
                this.step(map);
            }
        }

        this.step = function(map) {
            var possible = false;
            console.log('Going '+ direction);
            switch(direction) {
                case 'u':
                    possible = map.checkAvailability(x, y - 1);
                        break;
                case 'd':
                    possible = map.checkAvailability(x, y + 1);
                        break;
                case 'l':
                    possible = map.checkAvailability(x - 1, y);
                        break;
                case 'r':
                    possible = map.checkAvailability(x + 1, y);
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

        this.shoot = function(map) {
            if (gunheat == 0) {
                bullet_x = x;
                bullet_y = y;
                switch(direction) {
                    case 'u':
                        bullet_y -=  2;
                        break;
                    case 'd':
                        bullet_y += 2;
                        break;
                    case 'l':
                        bullet_x -= 2;
                        break;
                    case 'r':
                        bullet_x += 2;
                        break;
                }
                map.addBullet(bullet_x, bullet_y);

                bullets_shot++;
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
})();

process.mixin(exports, battlecity);