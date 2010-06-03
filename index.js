var battlecity;

(function(){

    var field = function() {
        this.x = '';
    }

    var map = function(map_array) {
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

        // Загружаем карту
        for (var row in map_array) {
            for (var column in map_array[row]) {
                console.log(map_array[row][column]);
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
            for (player_id in players) {
                player[player_id].move();
            }

            // Подвинуть пули (4 раза),..
            // ...проверить не попали ли в кого нибудь
            for (var bullet in bullets) {
                for (var player in players) {
                    var pos = players[player].position();
                    // Если попали...
                    if (Math.abs(bullet.x - pos.x) < 3 && Math.abs(bullet.y - pos.y) < 3 ) {

                        if (!players[player].damage()) {
                            // Последнюю статистику забираем
                            var stats = players[player].stats();
                            unset(players[player]);
                        }
                    }
                }
            }

            // Конец хода
        }
    }

    var tank = function() {
        var x = 0;
        var y = 0;

        var direction = 'n'

        // Statistics
        var odometer = 0;
        var bullets_shot = 0;

        var speed = 1;

        this.turn = function(new_direction) {
            direction = new_direction;
        }

        this.move = function(map) {
            for (var i = 0; i < speed; i++) {
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
            state = dead;
            return false;
        }

        this.stats = function() {
            return {'mov':odometer, 'sht':bullets_shot};
        }
    }
})();

process.mixin(exports, battlecity);