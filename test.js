var battlecity = require('./index').battlecity;
var sys = require('sys');

var stage = new battlecity.map;

//stage.showmap();
sys.puts('');
sys.puts('');
sys.puts('');

/*
setInterval(function() {
    stage.progress();
    stage.showmap();
}, 500);
*/

var map = [[' ', ' ', ' '],[' ', '#', ' '],[' ', ' ', ' ']];

stage.load_ai(1, 1, function(err, ai) {
    if (err) {
        sys.puts('Error loading AI');
    } else {
        sys.puts('AI loaded');
        sys.puts('Sending request');

        ai.safe_request(map, function(err, order) {
            if (err) {
                sys.puts('Error');
                if (order.status == 'too long') {
                    sys.puts('Too long');
                }
            } else {
                sys.puts('Got order from AI: ' + sys.inspect(order));
                sys.puts('Sending second request');
                ai.safe_request(map, function(err, order) {
                    if (!err) {
                        sys.puts('Got order from AI: ' + sys.inspect(order));
                        ai.die();
                    } else {
                        sys.puts('Error on 2nd call');
                        if (order.status == 'too long') {
                            sys.puts('Too long');
                        }
                    }
                });
            }
        });
    }
});


