var sys = require('sys');

var logic = {};
process.stdio.open('ascii');

process.stdio.addListener('data', function(message_raw) {
    var messages  = message_raw.split('\n');

    for (message_id in messages) {
        try {
            message = JSON.parse(messages[message_id]);
        } catch(e) {
            sys.puts('message: ' + messages[message_id] + '; error: ' + e);
            message = {};
        }

        if (message.action == 'load') {
            logic = {
                'tick': function(map) {
                    return {'move': true, 'turn':'n', 'shoot':false};
                }
            };

            process.stdout.write(JSON.stringify({'status':1}));

        } else if (message.action == 'tick') {

            var state = logic.tick();
            process.stdio.write(JSON.stringify(state));

        } else if (message.action == 'close') {

            process.stdio.close();
            exit(0);
            
        }
    }
});
