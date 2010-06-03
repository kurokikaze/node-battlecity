var battlecity = {};

(function(){

    battlecity.map = function(map_array) {
        // ' ' : Ничего
        // 'f' : Лес
        // 'w' : Вода
        // '#' : Кирпичи
        // 'C' : Бетон
        // 'i' : Лёд
        // 'i' : Лёд

        /*
        [[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
         [' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ','#','#','#',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
         [' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' '],
         [' ','#',' ',' ','#','#','#','#','#',' ',' ','#',' '],
         [' ','#',' ',' ','#','B','B','B','#',' ',' ','#',' '],
         [' ','#',' ',' ','#','B','B','B','#',' ',' ','#',' '],
         [' ',' ',' ',' ','#','B','B','B','#',' ',' ',' ',' ']]

        */

        var map = [[],[],[],[],[],[],[],[],[],[],[]];

        var bullets = [];

        var turn_number = 1;

        // Загружаем карту
        for (var row in map_array) {
            for (var column in map_array[row]) {
                // Каждый квадрат карты это 3 квадрата поля
                for (var i = 0; i<3; i++) {
                    for (var j = 0; j<3; j++) {
                        map[(parseInt(row) * 3)  + i][(parseInt(column) * 3) + j] = map_array[row][column];
                    }
                }
            }
        }

        var players = [];

        // Загружаем игроков
        players.push(new tank);
        players.push(new tank);

        this.checkAvailability = function(x, y) {
            console.log('Testing ' + x + ', ' + y);
            if (map[x][y] === ' ' || map[x][y] === 'f') {
                return true;
            } else {
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
                    case 'd':
                        possible = map.checkAvailability(bullet.x, bullet.y + 1);
                    case 'l':
                        possible = map.checkAvailability(bullet.x - 1, bullet.y);
                    case 'r':
                        possible = map.checkAvailability(bullet.x + 1, bullet.y);
                }

                if (possible) {
                    switch(bullet.dir) {
                        case 'u':
                            bullets[bullet_id].y = bullet.y - 1;
                        case 'd':
                            bullets[bullet_id].y = bullet.y + 1;
                        case 'l':
                            bullets[bullet_id].x = bullet.x - 1;
                        case 'r':
                            bullets[bullet_id].x = bullet.x + 1;
                    }

                } else {
                    // Стена! Пока просто уберём пулю
                    unset(bullets[bullet_id]);
                }

                for (var player in players) {
                    var pos = players[player].position();
                    // Если попали...
                    if (Math.abs(bullet.x - pos.x) < 3 && Math.abs(bullet.y - pos.y) < 3 ) {

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
    }

    var tank = function(setx, sety) {
        var x = setx | 0;
        var y = sety | 0;

        var direction = 'd';
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
            switch(direction) {
                case 'u':
                    possible = map.checkAvailability(x, y - 1);
                case 'd':
                    possible = map.checkAvailability(x, y + 1);
                case 'l':
                    possible = map.checkAvailability(x - 1, y);
                case 'r':
                    possible = map.checkAvailability(x + 1, y);
            }

            if (possible) {
                switch(direction) {
                    case 'u':
                        y = y - 1;
                    case 'd':
                        y = y + 1;
                    case 'l':
                        x = x - 1;
                    case 'r':
                        x = x + 1;
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
                    case 'd':
                        bullet_y += 2;
                    case 'l':
                        bullet_x -= 2;
                    case 'r':
                        bullet_x += 2;
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