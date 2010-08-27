var battlecity = require('./index').battlecity;
var sys = require('sys');

var stage = new battlecity.map;

stage.showmap();
sys.puts('');
sys.puts('');
sys.puts('');

/*
setInterval(function() {
    stage.progress();
    stage.showmap();
}, 500);
*/

stage.load_ai(1);


