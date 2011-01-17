var sys = require('sys');

var logic = {};

var stdin = process.openStdin();
stdin.setEncoding('utf-8');

//process.stderr.write('Running');

var client_map = function() {
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

    var self_map = this;

    var seed_spots = [
        {'x':0, 'y':0, 'cooldown': 4},
        {'x':13 * 4, 'y':0, 'cooldown': 4}
    ]

    this.getMapSquare = function(x, y) {
        if (x < 0 || x > (4*13) || y < 0 || y > (4*13)) {
            return false;
        } else {
            return map[y][x];
        }

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

}

var map = new client_map();

stdin.addListener('data', function(message_raw) {
    sys.debug('got message: ' + message_raw);
    var messages  = message_raw.split('\n');

    var direction = 'n';
    var x = 1;
    var y = 1;
    var gunheat = 0;

    for (message_id in messages) {
        try {
            message = JSON.parse(messages[message_id]);
        } catch(e) {
            //process.stdout.write('message: ' + messages[message_id] + '; error: ' + e);
            message = {};
        }

        if (message.action == 'load') {

            sys.debug('got load command');

            logic = {
                'tick': function(map) {
                    var dir = 'n';
                    if (map.getMapSquare(this.getX() + 1, this.getY() + 1) == '#') {
                        dir = 'r';
                    }
                    return {'move': true, 'turn':dir, 'shoot': (this.getHeat() == 0)};
                },

                'getX': function() {
                    return 1;
                },

                'getY': function() {
                    return 1;
                },

                'getDir': function() {
                    return direction;
                },

                'getHeat': function() {
                    return gunheat;
                }

            };

            process.stdout.write(JSON.stringify({'status':1}));

        } else if (message.action == 'set') {

            x = message.x;
            y = message.y;
            gunheat = message.gunheat;
            direction = message.direction;

        } else if (message.action == 'request') {

            var state = logic.tick(map);
            process.stdout.write(JSON.stringify(state));

        } else if (message.action == 'close') {

            stdin.close();
            exit(0);

        }
    }
});

//sys.debug('Running');
//process.stdout.write(JSON.stringify({'status':'running'}));
