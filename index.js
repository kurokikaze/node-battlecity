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

        // Содержание хода
        this.progress = function() {
            // Создать противников, если нужно

            // Опросить и подвинуть танки игроков, проверить столкновения
            for (player_id in players) {
                player[player_id].move();
            }

            // Подвинуть пули (4 раза), проверить не попали ли в кого нибудь
        }
    }

    var tank = function() {
        var x = 0;
        var y = 0;

        var direction = 'n'
        // Odometer
        var odometer = 0;

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

                odometer += 1;
            }

            return possible;
        }

        this.shoot = function(map) {
            if (gunheat == 0) {
                map.addBullet(x,y,direction);
            }
        }

        this.cooldown = function() {
            if (gunheat > 0) {
                gunheat -= 1;
            }
        }
    }
})();

process.mixin(exports, battlecity);