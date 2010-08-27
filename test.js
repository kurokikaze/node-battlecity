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

stage.load_ai(1, 1, function(err, ai) {
    if (err) {
        sys.puts('Error loading AI');
    } else {
        sys.puts('AI loaded');
        sys.puts('Sending request');
        ai.request([[' ', ' ', ' '],[' ', '#', ' '],[' ', ' ', ' ']]);
        ai.on('order', function(order) {
            sys.puts('Got order from AI: ' + sys.inspect(order));
            ai.die();
        });
    }
});


