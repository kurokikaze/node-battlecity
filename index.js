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
        [[' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ',' ',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ',' ',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ','#',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ','#',' '],
         [' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ',' ',' ']]


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

        this.checkAvailability = function(x, y) {
            if (map[x][y] === ' ' || map[x][y] === 'f') {
                return true;
            } else {
                return false;
            }
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