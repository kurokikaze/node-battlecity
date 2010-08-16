var battlecity = require('./index').battlecity;
var sys = require('sys');

var stage = new battlecity.map;

stage.showmap();
sys.puts('');
sys.puts('');
sys.puts('');

setInterval(function() {
    stage.progress();
    stage.showmap();
}, 1000);


    battlecity.enemies = {
        crawler: {
            speed: 1;
        },
        runner: {
            speed: 2;
        },
        heavy: {
            speed: 1;
        },
        hunter: {
            speed: 1;
        },
        digger: {
            speed: 1;
        },
        vindicator: {
            speed: 1;
        }
    }